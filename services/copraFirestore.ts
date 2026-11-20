import {
  collection,
  doc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import * as Crypto from 'expo-crypto';
import { IOT_AUTO_BATCH_WRITES_ENABLED } from '@/config/iotAutoBatch';
import { db } from '@/config/firebase';
import { getDeterministicIotBatchId, isValidIotSessionId } from '@/services/iotAutoBatch';
import type {
  AlertRecord,
  CopraBatchRecord,
  DeliveryRecord,
  DeliveryStatus,
  MonitoringRecord,
  UserRecord,
  WarehouseOption,
  WeightRecord,
} from '@/models/firestore';

type Listener<T> = (records: T[]) => void;
type Failure = (error: Error) => void;

const timestamp = (value: unknown) => value instanceof Timestamp ? value : null;
const stringValue = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;

export function subscribeUser(uid: string, next: (user: UserRecord | null) => void, fail: Failure): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (!snapshot.exists()) return next(null);
    const data = snapshot.data();
    const role = data.role === 'farmer' || data.role === 'warehouse' ? data.role : null;
    if (!role) return next(null);
    next({ uid: snapshot.id, email: stringValue(data.email), role, displayName: typeof data.displayName === 'string' ? data.displayName : undefined, warehouseName: typeof data.warehouseName === 'string' ? data.warehouseName : undefined });
  }, fail);
}

export function subscribeWarehouses(next: Listener<WarehouseOption>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'users'), where('role', '==', 'warehouse'), orderBy(documentId())), (snapshot) => {
    next(snapshot.docs.map((item) => ({ uid: item.id, email: stringValue(item.data().email), displayName: typeof item.data().displayName === 'string' ? item.data().displayName : undefined, warehouseName: typeof item.data().warehouseName === 'string' ? item.data().warehouseName : undefined })));
  }, fail);
}

export function subscribeBatches(farmerUid: string, next: Listener<CopraBatchRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'copra_batches'), where('createdBy', '==', farmerUid), orderBy('batchDate', 'desc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseBatch(item) ?? []));
  }, fail);
}

export function subscribeMonitoring(next: Listener<MonitoringRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'monitoring_records'), orderBy('recordedAt', 'asc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseMonitoring(item) ?? []));
  }, fail);
}

export function subscribeWeights(next: Listener<WeightRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'weight_records'), orderBy('recordedAt', 'desc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseWeight(item) ?? []));
  }, fail);
}

export function subscribeAlerts(next: Listener<AlertRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'alert_records'), orderBy('alertDateTime', 'desc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseAlert(item) ?? []));
  }, fail);
}

export function subscribeFarmerDeliveries(farmerUid: string, next: Listener<DeliveryRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'delivery_records'), where('createdBy', '==', farmerUid), orderBy('deliveryDate', 'desc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseDelivery(item) ?? []));
  }, fail);
}

export function subscribeWarehouseDeliveries(warehouseUid: string, next: Listener<DeliveryRecord>, fail: Failure): Unsubscribe {
  return onSnapshot(query(collection(db, 'delivery_records'), where('warehouseUserId', '==', warehouseUid), orderBy('deliveryDate', 'desc')), (snapshot) => {
    next(snapshot.docs.flatMap((item) => parseDelivery(item) ?? []));
  }, fail);
}

export async function createBatchRecord(input: { farmerUid: string; batchDate: Date }) {
  const batchId = makeId('BATCH');
  const batchRef = doc(db, 'copra_batches', batchId);
  const counterRef = doc(db, 'sequence_counters', 'batches');
  const batchNumber = await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const currentValue = readCounterValue(counter.data()?.currentValue);
    const nextValue = currentValue + 1;
    transaction.set(batchRef, { batchId, batchNumber: nextValue, createdBy: input.farmerUid, batchDate: Timestamp.fromDate(input.batchDate), batchStatus: 'active' });
    transaction.set(counterRef, { kind: 'batch', currentValue: nextValue, lastRecordId: batchId, updatedBy: input.farmerUid, updatedAt: serverTimestamp() });
    return nextValue;
  });
  return { batchId, batchNumber };
}

export async function createIotLinkedBatchRecord(input: { farmerUid: string; sessionId: string; batchDate: Date }) {
  if (!IOT_AUTO_BATCH_WRITES_ENABLED) throw new Error('Automatic IoT batch creation is disabled.');
  const normalizedSessionId = input.sessionId.trim();
  if (!isValidIotSessionId(normalizedSessionId)) throw new Error('A valid IoT session ID is required.');
  if (Number.isNaN(input.batchDate.getTime())) throw new Error('A valid IoT cooking start time is required.');

  const batchId = getDeterministicIotBatchId(normalizedSessionId);
  const existingAssociation = await getDocs(query(
    collection(db, 'copra_batches'),
    where('iotSessionId', '==', normalizedSessionId),
    limit(1),
  ));
  if (existingAssociation.docs.some((item) => item.id !== batchId)) {
    throw new Error('This IoT session is already linked to an existing batch.');
  }
  const batchRef = doc(db, 'copra_batches', batchId);
  const linkRef = doc(db, 'iot_session_links', normalizedSessionId);
  const counterRef = doc(db, 'sequence_counters', 'batches');
  return runTransaction(db, async (transaction) => {
    const batchSnapshot = await transaction.get(batchRef);
    const linkSnapshot = await transaction.get(linkRef);
    const counterSnapshot = await transaction.get(counterRef);

    if (batchSnapshot.exists() || linkSnapshot.exists()) {
      if (!batchSnapshot.exists() || !linkSnapshot.exists()) throw new Error('The IoT session mapping is incomplete. Automatic creation was stopped.');
      const batch = batchSnapshot.data();
      const link = linkSnapshot.data();
      const batchNumber = readPositiveInteger(batch.batchNumber);
      if (batch.createdBy !== input.farmerUid || batch.iotSessionId !== normalizedSessionId
        || link.batchId !== batchId || link.sessionId !== normalizedSessionId || link.ownerUid !== input.farmerUid) {
        throw new Error('This IoT session is already associated with another batch or Farmer.');
      }
      return { batchId, batchNumber, created: false };
    }

    const batchNumber = readCounterValue(counterSnapshot.data()?.currentValue) + 1;
    transaction.set(batchRef, {
      batchId,
      batchNumber,
      createdBy: input.farmerUid,
      batchDate: Timestamp.fromDate(input.batchDate),
      batchStatus: 'active',
      iotSessionId: normalizedSessionId,
    });
    transaction.set(linkRef, {
      sessionId: normalizedSessionId,
      batchId,
      ownerUid: input.farmerUid,
      createdAt: serverTimestamp(),
    });
    transaction.set(counterRef, { kind: 'batch', currentValue: batchNumber, lastRecordId: batchId, updatedBy: input.farmerUid, updatedAt: serverTimestamp() });
    return { batchId, batchNumber, created: true };
  });
}

export async function createDeliveryRecord(input: { farmerUid: string; warehouseUserId: string; deliveryDate: Date }) {
  const deliveryId = makeId('DEL');
  const deliveryRef = doc(db, 'delivery_records', deliveryId);
  const counterRef = doc(db, 'sequence_counters', 'deliveries');
  const deliveryNumber = await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const currentValue = readCounterValue(counter.data()?.currentValue);
    const nextValue = currentValue + 1;
    transaction.set(deliveryRef, {
      deliveryId,
      deliveryNumber: nextValue,
      warehouseUserId: input.warehouseUserId,
      createdBy: input.farmerUid,
      updatedBy: null,
      createdAt: serverTimestamp(),
      deliveryDate: Timestamp.fromDate(input.deliveryDate),
      deliveryStatus: 'Scheduled',
    });
    transaction.set(counterRef, { kind: 'delivery', currentValue: nextValue, lastRecordId: deliveryId, updatedBy: input.farmerUid, updatedAt: serverTimestamp() });
    return nextValue;
  });
  return { deliveryId, deliveryNumber };
}

export async function completeBatchRecord(batchId: string, farmerUid: string) {
  const batchRef = doc(db, 'copra_batches', batchId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(batchRef);
    if (!snapshot.exists()) throw new Error('This batch no longer exists.');
    const data = snapshot.data();
    if (data.createdBy !== farmerUid) throw new Error('You can only complete your own batch.');
    if (data.batchStatus !== 'active') throw new Error('This batch has already been completed.');
    transaction.update(batchRef, {
      batchStatus: 'completed',
      completedAt: serverTimestamp(),
      completedBy: farmerUid,
    });
  });
}

export async function linkBatchToIotSessionRecord(batchId: string, sessionId: string, farmerUid: string) {
  const normalizedSessionId = sessionId.trim();
  if (!isValidIotSessionId(normalizedSessionId)) throw new Error('Select a valid IoT session.');

  // Preserve compatibility with the currently deployed rules until the
  // reservation rules and gated app release are enabled together.
  if (!IOT_AUTO_BATCH_WRITES_ENABLED) {
    const duplicate = await getDocs(query(
      collection(db, 'copra_batches'),
      where('iotSessionId', '==', normalizedSessionId),
      limit(1),
    ));
    if (duplicate.docs.some((item) => item.id !== batchId)) throw new Error('This IoT session is already linked to another batch.');

    const legacyBatchRef = doc(db, 'copra_batches', batchId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(legacyBatchRef);
      if (!snapshot.exists()) throw new Error('This batch no longer exists.');
      const data = snapshot.data();
      if (data.createdBy !== farmerUid) throw new Error('You can only link an IoT session to your own batch.');
      if (data.batchStatus !== 'active') throw new Error('Only an active batch can be linked to an IoT session.');
      if (typeof data.iotSessionId === 'string' && data.iotSessionId.trim()) {
        throw new Error(data.iotSessionId === normalizedSessionId
          ? 'This IoT session is already linked to the batch.'
          : 'This batch is already linked to a different IoT session. Existing links cannot be overwritten.');
      }
      transaction.update(legacyBatchRef, { iotSessionId: normalizedSessionId });
    });
    return;
  }

  const batchRef = doc(db, 'copra_batches', batchId);
  const linkRef = doc(db, 'iot_session_links', normalizedSessionId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(batchRef);
    const linkSnapshot = await transaction.get(linkRef);
    if (!snapshot.exists()) throw new Error('This batch no longer exists.');
    const data = snapshot.data();
    if (data.createdBy !== farmerUid) throw new Error('You can only link an IoT session to your own batch.');
    if (data.batchStatus !== 'active') throw new Error('Only an active batch can be linked to an IoT session.');
    if (typeof data.iotSessionId === 'string' && data.iotSessionId.trim()) {
      throw new Error(data.iotSessionId === normalizedSessionId
        ? 'This IoT session is already linked to the batch.'
        : 'This batch is already linked to a different IoT session. Existing links cannot be overwritten.');
    }
    if (linkSnapshot.exists()) throw new Error('This IoT session is already linked to another batch.');
    transaction.set(linkRef, { sessionId: normalizedSessionId, batchId, ownerUid: farmerUid, createdAt: serverTimestamp() });
    transaction.update(batchRef, { iotSessionId: normalizedSessionId });
  });
}

export async function markAlertReadRecord(alertId: string, _uid: string) {
  await updateDoc(doc(db, 'alert_records', alertId), { isRead: true, readAt: serverTimestamp() });
}

export async function updateDeliveryStatusRecord(deliveryId: string, status: DeliveryStatus, uid: string) {
  await updateDoc(doc(db, 'delivery_records', deliveryId), { deliveryStatus: status, updatedBy: uid });
}

function makeId(prefix: 'BATCH' | 'WEIGHT' | 'DEL') {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Crypto.randomUUID().replaceAll('-', '').toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

function readCounterValue(value: unknown) {
  if (value == null) return 0;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error('The sequence counter is invalid. Contact an administrator before creating records.');
  return value;
}

function readPositiveInteger(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) throw new Error('The existing batch number is invalid.');
  return value;
}

function parseBatch(item: QueryDocumentSnapshot<DocumentData>): CopraBatchRecord | null {
  const data = item.data(); const batchDate = timestamp(data.batchDate);
  if (!batchDate || typeof data.createdBy !== 'string' || (data.batchStatus !== 'active' && data.batchStatus !== 'completed')) return null;
  const completedAt = timestamp(data.completedAt);
  return {
    batchId: stringValue(data.batchId, item.id),
    displayCode: typeof data.displayCode === 'string' ? data.displayCode : undefined,
    batchNumber: typeof data.batchNumber === 'number' && Number.isSafeInteger(data.batchNumber) && data.batchNumber > 0 ? data.batchNumber : undefined,
    createdBy: data.createdBy,
    batchDate,
    batchStatus: data.batchStatus,
    iotSessionId: typeof data.iotSessionId === 'string' && data.iotSessionId.trim() ? data.iotSessionId.trim() : undefined,
    completedAt: completedAt ?? undefined,
    completedBy: typeof data.completedBy === 'string' ? data.completedBy : undefined,
  };
}

function parseMonitoring(item: QueryDocumentSnapshot<DocumentData>): MonitoringRecord | null {
  const data = item.data(); const recordedAt = timestamp(data.recordedAt);
  const dryingStatus = data.dryingStatus === 'GOOD' || data.dryingStatus === 'NOT GOOD' || data.dryingStatus === 'BAD TIME' ? data.dryingStatus : null;
  const remaining = typeof data.estimatedTimeRemaining === 'number' && Number.isFinite(data.estimatedTimeRemaining) && data.estimatedTimeRemaining >= 0 ? data.estimatedTimeRemaining : null;
  if (!recordedAt || typeof data.batchId !== 'string' || !data.batchId.trim() || typeof data.temperature !== 'number' || !Number.isFinite(data.temperature)) return null;
  return { monitoringId: stringValue(data.monitoringId, item.id), batchId: data.batchId, temperature: data.temperature, dryingStatus, estimatedTimeRemaining: remaining, recordedAt };
}

function parseWeight(item: QueryDocumentSnapshot<DocumentData>): WeightRecord | null {
  const data = item.data(); const recordedAt = timestamp(data.recordedAt);
  const batchId = typeof data.batchId === 'string' ? data.batchId : undefined;
  const deliveryId = typeof data.deliveryId === 'string' ? data.deliveryId : undefined;
  if (!recordedAt || (!batchId && !deliveryId) || typeof data.weight !== 'number' || !Number.isFinite(data.weight) || data.weight <= 0) return null;
  return { weightId: stringValue(data.weightId, item.id), batchId, deliveryId, sackId: typeof data.sackId === 'string' ? data.sackId : undefined, weight: data.weight, recordedAt };
}

function parseAlert(item: QueryDocumentSnapshot<DocumentData>): AlertRecord | null {
  const data = item.data(); const alertDateTime = timestamp(data.alertDateTime);
  if (!alertDateTime || typeof data.batchId !== 'string' || !data.batchId.trim() || typeof data.alertMessage !== 'string' || typeof data.isRead !== 'boolean') return null;
  return { alertId: stringValue(data.alertId, item.id), batchId: data.batchId, alertType: stringValue(data.alertType, 'Drying alert'), alertMessage: data.alertMessage, alertDateTime, isRead: data.isRead, readAt: timestamp(data.readAt) };
}

function parseDelivery(item: QueryDocumentSnapshot<DocumentData>): DeliveryRecord | null {
  const data = item.data(); const deliveryDate = timestamp(data.deliveryDate);
  const validStatus = data.deliveryStatus === 'Scheduled' || data.deliveryStatus === 'In Transit' || data.deliveryStatus === 'Received' || data.deliveryStatus === 'Cancelled';
  if (!deliveryDate || !validStatus || typeof data.warehouseUserId !== 'string' || typeof data.createdBy !== 'string') return null;
  return { deliveryId: stringValue(data.deliveryId, item.id), displayCode: typeof data.displayCode === 'string' ? data.displayCode : undefined, deliveryNumber: typeof data.deliveryNumber === 'number' && Number.isSafeInteger(data.deliveryNumber) && data.deliveryNumber > 0 ? data.deliveryNumber : undefined, batchId: typeof data.batchId === 'string' ? data.batchId : undefined, warehouseUserId: data.warehouseUserId, createdBy: data.createdBy, updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : null, deliveryWeight: typeof data.deliveryWeight === 'number' ? data.deliveryWeight : undefined, createdAt: timestamp(data.createdAt) ?? undefined, deliveryDate, deliveryStatus: data.deliveryStatus };
}
