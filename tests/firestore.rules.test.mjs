import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';

const projectId = 'copra-alert-rules-test';
let environment;

before(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const users = [
      ['farmer-1', { uid: 'farmer-1', email: 'farmer@test.com', role: 'farmer' }],
      ['farmer-2', { uid: 'farmer-2', email: 'farmer2@test.com', role: 'farmer' }],
      ['warehouse-1', { uid: 'warehouse-1', email: 'warehouse1@test.com', role: 'warehouse' }],
      ['warehouse-2', { uid: 'warehouse-2', email: 'warehouse2@test.com', role: 'warehouse' }],
    ];
    await Promise.all(users.map(([id, data]) => setDoc(doc(db, 'users', id), data)));
    await setDoc(doc(db, 'copra_batches', 'BATCH-1'), { batchId: 'BATCH-1', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' });
    await setDoc(doc(db, 'copra_batches', 'BATCH-DONE'), { batchId: 'BATCH-DONE', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'completed', completedAt: Timestamp.now(), completedBy: 'farmer-1' });
    await setDoc(doc(db, 'monitoring_records', 'MON-1'), { monitoringId: 'MON-1', batchId: 'BATCH-1', temperature: 48.2, dryingStatus: 'GOOD', estimatedTimeRemaining: 120, recordedAt: Timestamp.now() });
    await setDoc(doc(db, 'alert_records', 'ALERT-1'), { alertId: 'ALERT-1', batchId: 'BATCH-1', alertType: 'Condition', alertMessage: 'Check batch', alertDateTime: Timestamp.now(), isRead: false, readAt: null });
    await setDoc(doc(db, 'delivery_records', 'DEL-1'), { deliveryId: 'DEL-1', batchId: 'BATCH-1', warehouseUserId: 'warehouse-1', createdBy: 'farmer-1', updatedBy: 'farmer-1', deliveryWeight: 80, deliveryDate: Timestamp.now(), deliveryStatus: 'In Transit' });
    await setDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryId: 'DEL-2', batchId: 'BATCH-1', warehouseUserId: 'warehouse-2', createdBy: 'farmer-1', updatedBy: null, deliveryWeight: 75, deliveryDate: Timestamp.now(), deliveryStatus: 'Scheduled' });
  });
});

after(async () => environment?.cleanup());

test('users cannot change their role but can update displayName', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'users', 'farmer-1'), { displayName: 'Farmer One' }));
  await assertFails(updateDoc(doc(db, 'users', 'farmer-1'), { role: 'warehouse' }));
});

test('farmer can query warehouse accounts while warehouse cannot list users', async () => {
  const farmerDb = environment.authenticatedContext('farmer-1').firestore();
  const warehouseDb = environment.authenticatedContext('warehouse-1').firestore();
  await assertSucceeds(getDocs(query(collection(farmerDb, 'users'), where('role', '==', 'warehouse'))));
  await assertFails(getDocs(collection(warehouseDb, 'users')));
});

test('farmer can create a valid batch and warehouse cannot', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const data = { batchId: 'BATCH-NEW', displayCode: 'B-7K2P9Q', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' };
  const creation = writeBatch(db);
  creation.set(doc(db, 'copra_batches', 'BATCH-NEW'), data);
  creation.set(doc(db, 'display_codes', 'B-7K2P9Q'), { displayCode: 'B-7K2P9Q', kind: 'batch', recordId: 'BATCH-NEW', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(creation.commit());
  await assertFails(setDoc(doc(environment.authenticatedContext('warehouse-1').firestore(), 'copra_batches', 'BATCH-W'), { ...data, batchId: 'BATCH-W', createdBy: 'warehouse-1' }));
});

test('new display codes require a valid atomic reservation and cannot collide', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const unreserved = { batchId: 'BATCH-NO-RESERVATION', displayCode: 'B-8M3R2X', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' };
  await assertFails(setDoc(doc(db, 'copra_batches', unreserved.batchId), unreserved));

  const invalid = writeBatch(db);
  invalid.set(doc(db, 'copra_batches', 'BATCH-BAD-CODE'), { ...unreserved, batchId: 'BATCH-BAD-CODE', displayCode: 'B-123' });
  invalid.set(doc(db, 'display_codes', 'B-123'), { displayCode: 'B-123', kind: 'batch', recordId: 'BATCH-BAD-CODE', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertFails(invalid.commit());

  const first = writeBatch(db);
  first.set(doc(db, 'copra_batches', 'BATCH-FIRST'), { ...unreserved, batchId: 'BATCH-FIRST' });
  first.set(doc(db, 'display_codes', 'B-8M3R2X'), { displayCode: 'B-8M3R2X', kind: 'batch', recordId: 'BATCH-FIRST', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(first.commit());

  const collision = writeBatch(db);
  collision.set(doc(db, 'copra_batches', 'BATCH-SECOND'), { ...unreserved, batchId: 'BATCH-SECOND' });
  collision.set(doc(db, 'display_codes', 'B-8M3R2X'), { displayCode: 'B-8M3R2X', kind: 'batch', recordId: 'BATCH-SECOND', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertFails(collision.commit());
});

test('display codes are immutable while legacy records remain updateable', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), { displayCode: 'B-7K2P9Q' }));
  await assertSucceeds(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('farmer can atomically create a delivery code reservation', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const delivery = { deliveryId: 'DEL-NEW', displayCode: 'D-4M8R2X', batchId: 'BATCH-1', warehouseUserId: 'warehouse-1', createdBy: 'farmer-1', updatedBy: null, deliveryWeight: 80, deliveryDate: Timestamp.now(), deliveryStatus: 'Scheduled' };
  const creation = writeBatch(db);
  creation.set(doc(db, 'delivery_records', 'DEL-NEW'), delivery);
  creation.set(doc(db, 'display_codes', 'D-4M8R2X'), { displayCode: 'D-4M8R2X', kind: 'delivery', recordId: 'DEL-NEW', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(creation.commit());
  await assertFails(updateDoc(doc(db, 'delivery_records', 'DEL-NEW'), { displayCode: 'D-7K2P9Q' }));
});

test('owning farmer can complete an active batch with server completion metadata', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('another farmer and warehouse cannot complete a batch they do not own', async () => {
  for (const uid of ['farmer-2', 'warehouse-1']) {
    const db = environment.authenticatedContext(uid).firestore();
    await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
      batchStatus: 'completed',
      completedAt: serverTimestamp(),
      completedBy: uid,
    }));
  }
});

test('completed batches cannot be reverted or completed twice', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-DONE'), { batchStatus: 'active' }));
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-DONE'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('batch completion cannot alter protected fields or forge completion metadata', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchId: 'CHANGED',
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: Timestamp.now(),
    completedBy: 'farmer-2',
  }));
});

test('mobile clients cannot create monitoring records or alerts', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(setDoc(doc(db, 'monitoring_records', 'MON-NEW'), { monitoringId: 'MON-NEW', batchId: 'BATCH-1', temperature: 50, dryingStatus: null, estimatedTimeRemaining: null, recordedAt: Timestamp.now() }));
  await assertFails(setDoc(doc(db, 'alert_records', 'ALERT-NEW'), { alertId: 'ALERT-NEW', batchId: 'BATCH-1', alertType: 'Test', alertMessage: 'Test', alertDateTime: Timestamp.now(), isRead: false, readAt: null }));
});

test('farmer can mark an alert read but cannot edit its message', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'alert_records', 'ALERT-1'), { isRead: true, readAt: Timestamp.now() }));
  await assertFails(updateDoc(doc(db, 'alert_records', 'ALERT-1'), { alertMessage: 'Changed' }));
});

test('warehouse can read only deliveries assigned to its UID', async () => {
  const db = environment.authenticatedContext('warehouse-1').firestore();
  await assertSucceeds(getDoc(doc(db, 'delivery_records', 'DEL-1')));
  await assertFails(getDoc(doc(db, 'delivery_records', 'DEL-2')));
  await assertSucceeds(getDocs(query(collection(db, 'delivery_records'), where('warehouseUserId', '==', 'warehouse-1'))));
  await assertFails(getDocs(collection(db, 'delivery_records')));
});

test('warehouse can receive an assigned in-transit delivery without editing protected fields', async () => {
  const assignedDb = environment.authenticatedContext('warehouse-1').firestore();
  const otherDb = environment.authenticatedContext('warehouse-2').firestore();
  await assertSucceeds(updateDoc(doc(assignedDb, 'delivery_records', 'DEL-1'), { deliveryStatus: 'Received', updatedBy: 'warehouse-1' }));
  await assertFails(updateDoc(doc(otherDb, 'delivery_records', 'DEL-1'), { deliveryStatus: 'Received', updatedBy: 'warehouse-2' }));
  await assertFails(updateDoc(doc(assignedDb, 'delivery_records', 'DEL-1'), { deliveryWeight: 1, deliveryStatus: 'Received', updatedBy: 'warehouse-1' }));
});

test('farmer cannot skip directly from Scheduled to Received', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryStatus: 'Received', updatedBy: 'farmer-1' }));
  await assertSucceeds(updateDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryStatus: 'In Transit', updatedBy: 'farmer-1' }));
});
