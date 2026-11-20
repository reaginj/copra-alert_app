import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/config/firebase';
import type {
  AlertRecord,
  BatchStatus,
  CopraBatchRecord,
  DeliveryRecord,
  DeliveryStatus,
  DryingStatus,
  MonitoringRecord,
  UserRecord,
  UserRole,
  WarehouseOption,
  WeightRecord,
} from '@/models/firestore';
import {
  completeBatchRecord,
  createBatchRecord,
  createDeliveryRecord,
  linkBatchToIotSessionRecord,
  markAlertReadRecord,
  subscribeAlerts,
  subscribeBatches,
  subscribeFarmerDeliveries,
  subscribeMonitoring,
  subscribeUser,
  subscribeWarehouseDeliveries,
  subscribeWarehouses,
  subscribeWeights,
  updateDeliveryStatusRecord,
} from '@/services/copraFirestore';

export type { DeliveryStatus, DryingStatus } from '@/models/firestore';

export type Batch = {
  id: string;
  displayCode: string;
  createdAt: string;
  startedAt: string;
  method: string;
  status?: DryingStatus;
  lifecycle: BatchStatus;
  completedAt?: string;
  weightKg?: number;
  iotSessionId?: string;
  elapsed: string;
  remaining: string;
};

export type Reading = { id: string; batchId: string; temperature: number; recordedAt: string };
export type DryingAlert = { id: string; batchId: string; batchDisplayCode: string; title: string; description: string; createdAt: string; read: boolean };
export type Delivery = {
  id: string;
  displayCode: string;
  batchId?: string;
  batchDisplayCode?: string;
  warehouseUserId: string;
  sourceFarm: string;
  legacyWeightKg?: number;
  totalWeightKg?: number;
  totalSacks: number;
  destination: string;
  createdAt?: string;
  deliveryDate: string;
  status: DeliveryStatus;
  dryingStatus?: DryingStatus;
  sackWeights?: { deliveryId?: string; measurementId?: string; sackId: string; weightKg: number }[];
};

export function getDeliveryWeightSummary(delivery: Pick<Delivery, 'sackWeights' | 'totalSacks' | 'totalWeightKg'>) {
  if (delivery.sackWeights?.length) {
    return {
      totalSacks: delivery.sackWeights.length,
      totalWeightKg: delivery.sackWeights.reduce((sum, item) => sum + item.weightKg, 0),
    };
  }
  if (delivery.totalSacks > 0 && delivery.totalWeightKg != null) return { totalSacks: delivery.totalSacks, totalWeightKg: delivery.totalWeightKg };
  return null;
}

type NewBatch = { startedAt: Date };
type NewDelivery = { warehouseUserId: string; deliveryDate: Date };

type SystemData = {
  dataSource: 'firestore';
  accountUid: string | null;
  role: UserRole | null;
  batchesLoaded: boolean;
  loading: boolean;
  error: string | null;
  batches: Batch[];
  readings: Reading[];
  alerts: DryingAlert[];
  deliveries: Delivery[];
  warehouses: WarehouseOption[];
  createBatch: (value: NewBatch) => Promise<void>;
  completeBatch: (batchId: string) => Promise<void>;
  linkBatchToIotSession: (batchId: string, sessionId: string) => Promise<void>;
  createDelivery: (value: NewDelivery) => Promise<string>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
};

const Context = createContext<SystemData | null>(null);

export function SystemDataProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<UserRecord | null>(null);
  const [rawBatches, setRawBatches] = useState<CopraBatchRecord[]>([]);
  const [rawMonitoring, setRawMonitoring] = useState<MonitoringRecord[]>([]);
  const [rawWeights, setRawWeights] = useState<WeightRecord[]>([]);
  const [rawAlerts, setRawAlerts] = useState<AlertRecord[]>([]);
  const [rawDeliveries, setRawDeliveries] = useState<DeliveryRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let userUnsubscribe: (() => void) | undefined;
    let dataUnsubscribes: (() => void)[] = [];
    let subscribedKey = '';
    const clearDataSubscriptions = () => { dataUnsubscribes.forEach((unsubscribe) => unsubscribe()); dataUnsubscribes = []; };
    const clearRecords = () => { setRawBatches([]); setRawMonitoring([]); setRawWeights([]); setRawAlerts([]); setRawDeliveries([]); setWarehouses([]); setBatchesLoaded(false); };
    const fail = (cause: Error) => { setError(cause.message || 'Unable to load Firestore data.'); setLoading(false); };

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      userUnsubscribe?.(); clearDataSubscriptions(); clearRecords(); setAccount(null); setError(null);
      if (!user) { subscribedKey = ''; setLoading(false); return; }
      setLoading(true);
      userUnsubscribe = subscribeUser(user.uid, (profile) => {
        setAccount(profile);
        if (!profile) { setError('The signed-in account does not have a valid Firestore profile.'); setLoading(false); return; }
        const key = `${profile.uid}:${profile.role}`;
        if (key === subscribedKey) return;
        subscribedKey = key; clearDataSubscriptions(); clearRecords();
        if (profile.role === 'farmer') {
          let pending = 6;
          const ready = <T,>(setter: (records: T[]) => void) => (records: T[]) => { setter(records); pending -= 1; if (pending === 0) setLoading(false); };
          dataUnsubscribes = [
            subscribeBatches(profile.uid, (records) => { setBatchesLoaded(true); ready(setRawBatches)(records); }, fail),
            subscribeMonitoring(ready(setRawMonitoring), fail),
            subscribeWeights(ready(setRawWeights), fail),
            subscribeAlerts(ready(setRawAlerts), fail),
            subscribeFarmerDeliveries(profile.uid, ready(setRawDeliveries), fail),
            subscribeWarehouses(ready(setWarehouses), fail),
          ];
        } else {
          dataUnsubscribes = [subscribeWarehouseDeliveries(profile.uid, (records) => { setRawDeliveries(records); setLoading(false); }, fail)];
        }
      }, fail);
    });

    return () => { authUnsubscribe(); userUnsubscribe?.(); clearDataSubscriptions(); };
  }, []);

  const latestMonitoring = useMemo(() => latestByBatch(rawMonitoring, (item) => item.batchId, (item) => item.recordedAt.toMillis()), [rawMonitoring]);
  const latestWeights = useMemo(() => latestByBatch(
    rawWeights.filter((item): item is WeightRecord & { batchId: string } => Boolean(item.batchId)),
    (item) => item.batchId,
    (item) => item.recordedAt.toMillis(),
  ), [rawWeights]);
  const warehouseNames = useMemo(() => new Map(warehouses.map((item) => [item.uid, item.warehouseName?.trim() || item.displayName?.trim() || item.email])), [warehouses]);

  const batches = useMemo<Batch[]>(() => rawBatches.map((item) => {
    const monitoring = latestMonitoring.get(item.batchId);
    const weight = latestWeights.get(item.batchId);
    const usesIotMonitoring = Boolean(item.iotSessionId);
    return {
      id: item.batchId,
      displayCode: item.batchNumber ? formatSequenceLabel('Batch', item.batchNumber) : item.displayCode ?? item.batchId,
      createdAt: item.batchDate.toDate().toISOString(),
      startedAt: item.batchDate.toDate().toISOString(),
      method: 'Unspecified',
      // Legacy Firestore monitoring results are not valid IoT computations.
      // Keep these fields unavailable until the IoT drying rules are validated.
      status: usesIotMonitoring ? undefined : monitoring?.dryingStatus ?? undefined,
      lifecycle: item.batchStatus,
      completedAt: item.completedAt?.toDate().toISOString(),
      weightKg: weight?.weight,
      iotSessionId: item.iotSessionId,
      elapsed: usesIotMonitoring ? 'UNAVAILABLE' : monitoring ? formatDuration(Math.max(0, Math.round((monitoring.recordedAt.toMillis() - item.batchDate.toMillis()) / 60000))) : 'Unavailable',
      remaining: usesIotMonitoring ? 'UNAVAILABLE' : item.batchStatus === 'completed' ? 'Completed' : monitoring?.estimatedTimeRemaining == null ? 'Unavailable' : formatDuration(monitoring.estimatedTimeRemaining),
    };
  }), [latestMonitoring, latestWeights, rawBatches]);

  const batchDisplayCodes = useMemo(() => new Map(rawBatches.map((item) => [item.batchId, item.batchNumber ? formatSequenceLabel('Batch', item.batchNumber) : item.displayCode ?? item.batchId])), [rawBatches]);
  const validBatchIds = useMemo(() => new Set(rawBatches.map((item) => item.batchId)), [rawBatches]);
  const weightsByDelivery = useMemo(() => groupDeliveryWeights(rawWeights), [rawWeights]);

  const readings = useMemo<Reading[]>(() => rawMonitoring.filter((item) => validBatchIds.has(item.batchId)).map((item) => ({ id: item.monitoringId, batchId: item.batchId, temperature: item.temperature, recordedAt: item.recordedAt.toDate().toISOString() })), [rawMonitoring, validBatchIds]);
  const alerts = useMemo<DryingAlert[]>(() => rawAlerts.filter((item) => validBatchIds.has(item.batchId)).map((item) => ({ id: item.alertId, batchId: item.batchId, batchDisplayCode: batchDisplayCodes.get(item.batchId)!, title: item.alertType, description: item.alertMessage, createdAt: item.alertDateTime.toDate().toISOString(), read: item.isRead })), [batchDisplayCodes, rawAlerts, validBatchIds]);
  const deliveries = useMemo<Delivery[]>(() => rawDeliveries.map((item) => {
    const weights = weightsByDelivery.get(item.deliveryId) ?? [];
    const sackWeights = weights.map((record, index) => ({ deliveryId: item.deliveryId, measurementId: record.weightId, sackId: record.sackId?.trim() || `Sack ${String(index + 1).padStart(3, '0')}`, weightKg: record.weight }));
    const summary = sackWeights.length ? { totalSacks: sackWeights.length, totalWeightKg: sackWeights.reduce((total, weight) => total + weight.weightKg, 0) } : null;
    return {
      id: item.deliveryId,
      displayCode: item.deliveryNumber ? formatSequenceLabel('Delivery', item.deliveryNumber) : item.displayCode ?? item.deliveryId,
      batchId: item.batchId,
      batchDisplayCode: item.batchId ? batchDisplayCodes.get(item.batchId) ?? item.batchId : undefined,
      warehouseUserId: item.warehouseUserId,
      sourceFarm: account?.role === 'farmer' ? account.displayName?.trim() || account.email : 'Assigned farm',
      legacyWeightKg: item.deliveryWeight,
      totalWeightKg: summary?.totalWeightKg,
      totalSacks: summary?.totalSacks ?? 0,
      destination: warehouseNames.get(item.warehouseUserId) || (account?.role === 'warehouse' && account.uid === item.warehouseUserId ? account.warehouseName?.trim() || account.displayName?.trim() || account.email : 'Assigned warehouse'),
      createdAt: item.createdAt?.toDate().toISOString(),
      deliveryDate: item.deliveryDate.toDate().toISOString(),
      status: item.deliveryStatus,
      dryingStatus: item.batchId ? latestMonitoring.get(item.batchId)?.dryingStatus ?? undefined : undefined,
      sackWeights,
    };
  }), [account, batchDisplayCodes, latestMonitoring, rawDeliveries, warehouseNames, weightsByDelivery]);

  const value = useMemo<SystemData>(() => ({
    dataSource: 'firestore', accountUid: account?.uid ?? null, role: account?.role ?? null, batchesLoaded, loading, error, batches, readings, alerts, deliveries, warehouses,
    createBatch: async (input) => {
      requireFarmer(account);
      if (Number.isNaN(input.startedAt.getTime()) || input.startedAt.getTime() > Date.now()) throw new Error('Select a valid start date that is not in the future.');
      await createBatchRecord({ farmerUid: account.uid, batchDate: input.startedAt });
    },
    completeBatch: async (batchId) => {
      requireFarmer(account);
      await completeBatchRecord(batchId, account.uid);
    },
    linkBatchToIotSession: async (batchId, sessionId) => {
      requireFarmer(account);
      await linkBatchToIotSessionRecord(batchId, sessionId, account.uid);
    },
    createDelivery: async (input) => {
      requireFarmer(account);
      if (Number.isNaN(input.deliveryDate.getTime())) throw new Error('Select a valid delivery date.');
      const created = await createDeliveryRecord({ farmerUid: account.uid, warehouseUserId: input.warehouseUserId, deliveryDate: input.deliveryDate });
      return created.deliveryId;
    },
    updateDeliveryStatus: async (id, status) => {
      if (!account) throw new Error('Sign in before updating a delivery.');
      await updateDeliveryStatusRecord(id, status, account.uid);
    },
    markAlertRead: async (id) => {
      requireFarmer(account);
      await markAlertReadRecord(id, account.uid);
    },
  }), [account, alerts, batches, batchesLoaded, deliveries, error, loading, readings, warehouses]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function latestByBatch<T>(items: T[], batchId: (item: T) => string, time: (item: T) => number) {
  const result = new Map<string, T>();
  items.forEach((item) => { const id = batchId(item); const current = result.get(id); if (!current || time(item) > time(current)) result.set(id, item); });
  return result;
}

function groupDeliveryWeights(records: WeightRecord[]) {
  const grouped = new Map<string, Map<string, WeightRecord>>();
  records.forEach((record) => {
    if (!record.deliveryId) return;
    const delivery = grouped.get(record.deliveryId) ?? new Map<string, WeightRecord>();
    const key = record.sackId?.trim() || record.weightId;
    const existing = delivery.get(key);
    if (!existing || record.recordedAt.toMillis() > existing.recordedAt.toMillis()) delivery.set(key, record);
    grouped.set(record.deliveryId, delivery);
  });
  return new Map([...grouped].map(([deliveryId, readings]) => [deliveryId, [...readings.values()]]));
}

function formatSequenceLabel(prefix: 'Batch' | 'Delivery', value: number) {
  return `${prefix} ${String(value).padStart(3, '0')}`;
}

function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const days = Math.floor(minutes / 1440);
  if (days) {
    const hours = Math.floor((minutes % 1440) / 60);
    return hours ? `${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(minutes / 60); const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

function requireFarmer(account: UserRecord | null): asserts account is UserRecord & { role: 'farmer' } {
  if (!account || account.role !== 'farmer') throw new Error('A Farmer account is required for this action.');
}

export function useSystemData() {
  const value = useContext(Context);
  if (!value) throw new Error('useSystemData must be used inside SystemDataProvider');
  return value;
}
