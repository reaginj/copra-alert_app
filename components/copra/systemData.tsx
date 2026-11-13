import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/config/firebase';
import { getSimulationScenario, SIMULATION_MODE_ENABLED, SIMULATION_SCENARIOS, type SimulationScenarioId } from '@/config/simulation';
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
  elapsed: string;
  remaining: string;
};

export type Reading = { id: string; batchId: string; temperature: number; recordedAt: string };
export type DryingAlert = { id: string; batchId: string; batchDisplayCode: string; title: string; description: string; createdAt: string; read: boolean };
export type Delivery = {
  id: string;
  displayCode: string;
  batchId: string;
  batchDisplayCode: string;
  warehouseUserId: string;
  sourceFarm: string;
  weightKg: number;
  destination: string;
  deliveryDate: string;
  status: DeliveryStatus;
  dryingStatus?: DryingStatus;
};

type NewBatch = { startedAt: Date; weightKg?: number };
type NewDelivery = { batchId: string; warehouseUserId: string; weightKg: number; deliveryDate: Date };

type SystemData = {
  dataSource: 'firestore';
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  batches: Batch[];
  readings: Reading[];
  alerts: DryingAlert[];
  deliveries: Delivery[];
  warehouses: WarehouseOption[];
  monitoringMode: 'live' | 'simulation';
  simulationAvailable: boolean;
  simulationScenario: SimulationScenarioId;
  simulationScenarios: typeof SIMULATION_SCENARIOS;
  setMonitoringMode: (mode: 'live' | 'simulation') => void;
  setSimulationScenario: (scenario: SimulationScenarioId) => void;
  createBatch: (value: NewBatch) => Promise<void>;
  completeBatch: (batchId: string) => Promise<void>;
  createDelivery: (value: NewDelivery) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitoringMode, setMonitoringModeState] = useState<'live' | 'simulation'>('live');
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenarioId>('good');
  const [simulationAlertRead, setSimulationAlertRead] = useState(false);

  useEffect(() => {
    let userUnsubscribe: (() => void) | undefined;
    let dataUnsubscribes: (() => void)[] = [];
    let subscribedKey = '';
    const clearDataSubscriptions = () => { dataUnsubscribes.forEach((unsubscribe) => unsubscribe()); dataUnsubscribes = []; };
    const clearRecords = () => { setRawBatches([]); setRawMonitoring([]); setRawWeights([]); setRawAlerts([]); setRawDeliveries([]); setWarehouses([]); };
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
            subscribeBatches(profile.uid, ready(setRawBatches), fail),
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
  const latestWeights = useMemo(() => latestByBatch(rawWeights, (item) => item.batchId, (item) => item.recordedAt.toMillis()), [rawWeights]);
  const warehouseNames = useMemo(() => new Map(warehouses.map((item) => [item.uid, item.warehouseName?.trim() || item.displayName?.trim() || item.email])), [warehouses]);

  const liveBatches = useMemo<Batch[]>(() => rawBatches.map((item) => {
    const monitoring = latestMonitoring.get(item.batchId);
    const weight = latestWeights.get(item.batchId);
    return {
      id: item.batchId,
      displayCode: item.displayCode ?? item.batchId,
      createdAt: item.batchDate.toDate().toISOString(),
      startedAt: item.batchDate.toDate().toISOString(),
      method: 'Unspecified',
      status: monitoring?.dryingStatus ?? undefined,
      lifecycle: item.batchStatus,
      completedAt: item.completedAt?.toDate().toISOString(),
      weightKg: weight?.weight,
      elapsed: monitoring ? formatDuration(Math.max(0, Math.round((monitoring.recordedAt.toMillis() - item.batchDate.toMillis()) / 60000))) : 'Unavailable',
      remaining: item.batchStatus === 'completed' ? 'Completed' : monitoring?.estimatedTimeRemaining == null ? 'Unavailable' : formatDuration(monitoring.estimatedTimeRemaining),
    };
  }), [latestMonitoring, latestWeights, rawBatches]);

  const batchDisplayCodes = useMemo(() => new Map(rawBatches.map((item) => [item.batchId, item.displayCode ?? item.batchId])), [rawBatches]);

  const simulationActive = SIMULATION_MODE_ENABLED && monitoringMode === 'simulation';
  const scenario = getSimulationScenario(simulationScenario);
  const simulatedBatchIds = useMemo(() => liveBatches.filter((item) => item.lifecycle === 'active').map((item) => item.id), [liveBatches]);
  const primarySimulatedBatchId = simulatedBatchIds[0];
  const batches = useMemo<Batch[]>(() => simulationActive
    ? liveBatches.map((item) => item.lifecycle === 'active' ? {
      ...item,
      status: scenario.dryingStatus,
      elapsed: formatDuration(scenario.elapsedMinutes),
      remaining: formatDuration(scenario.estimatedMinutesRemaining),
    } : item)
    : liveBatches, [liveBatches, scenario, simulationActive]);

  const liveReadings = useMemo<Reading[]>(() => rawMonitoring.map((item) => ({ id: item.monitoringId, batchId: item.batchId, temperature: item.temperature, recordedAt: item.recordedAt.toDate().toISOString() })), [rawMonitoring]);
  const readings = useMemo<Reading[]>(() => simulationActive && simulatedBatchIds.length
    ? [
      ...liveReadings.filter((item) => !simulatedBatchIds.includes(item.batchId)),
      ...simulatedBatchIds.flatMap((batchId) => makeSimulationReadings(batchId, scenario.temperatures)),
    ]
    : liveReadings, [liveReadings, scenario.temperatures, simulatedBatchIds, simulationActive]);
  const liveAlerts = useMemo<DryingAlert[]>(() => rawAlerts.map((item) => ({ id: item.alertId, batchId: item.batchId, batchDisplayCode: batchDisplayCodes.get(item.batchId) ?? item.batchId, title: item.alertType, description: item.alertMessage, createdAt: item.alertDateTime.toDate().toISOString(), read: item.isRead })), [batchDisplayCodes, rawAlerts]);
  const alerts = useMemo<DryingAlert[]>(() => simulationActive && primarySimulatedBatchId && scenario.inspectionRequired
    ? [{ id: `SIM-INSPECTION-${primarySimulatedBatchId}`, batchId: primarySimulatedBatchId, batchDisplayCode: batchDisplayCodes.get(primarySimulatedBatchId) ?? primarySimulatedBatchId, title: 'Physical inspection required', description: 'The simulated estimated drying time has reached zero. Physically check the copra before completing this batch.', createdAt: new Date().toISOString(), read: simulationAlertRead }, ...liveAlerts]
    : liveAlerts, [batchDisplayCodes, liveAlerts, primarySimulatedBatchId, scenario.inspectionRequired, simulationActive, simulationAlertRead]);
  const deliveries = useMemo<Delivery[]>(() => rawDeliveries.map((item) => ({
    id: item.deliveryId,
    displayCode: item.displayCode ?? item.deliveryId,
    batchId: item.batchId,
    batchDisplayCode: batchDisplayCodes.get(item.batchId) ?? item.batchId,
    warehouseUserId: item.warehouseUserId,
    sourceFarm: account?.role === 'farmer' ? account.displayName?.trim() || account.email : 'Assigned farm',
    weightKg: item.deliveryWeight,
    destination: warehouseNames.get(item.warehouseUserId) || (account?.role === 'warehouse' && account.uid === item.warehouseUserId ? account.warehouseName?.trim() || account.displayName?.trim() || account.email : 'Assigned warehouse'),
    deliveryDate: item.deliveryDate.toDate().toISOString(),
    status: item.deliveryStatus,
    dryingStatus: latestMonitoring.get(item.batchId)?.dryingStatus ?? undefined,
  })), [account, batchDisplayCodes, latestMonitoring, rawDeliveries, warehouseNames]);

  const value = useMemo<SystemData>(() => ({
    dataSource: 'firestore', role: account?.role ?? null, loading, error, batches, readings, alerts, deliveries, warehouses,
    monitoringMode: simulationActive ? 'simulation' : 'live',
    simulationAvailable: SIMULATION_MODE_ENABLED,
    simulationScenario,
    simulationScenarios: SIMULATION_SCENARIOS,
    setMonitoringMode: (mode) => {
      setMonitoringModeState(SIMULATION_MODE_ENABLED ? mode : 'live');
      setSimulationAlertRead(false);
    },
    setSimulationScenario: (nextScenario) => {
      setSimulationScenario(nextScenario);
      setSimulationAlertRead(false);
    },
    createBatch: async (input) => {
      requireFarmer(account);
      if (Number.isNaN(input.startedAt.getTime()) || input.startedAt.getTime() > Date.now()) throw new Error('Select a valid start date that is not in the future.');
      await createBatchRecord({ farmerUid: account.uid, batchDate: input.startedAt, weightKg: input.weightKg });
    },
    completeBatch: async (batchId) => {
      requireFarmer(account);
      await completeBatchRecord(batchId, account.uid);
    },
    createDelivery: async (input) => {
      requireFarmer(account);
      if (Number.isNaN(input.deliveryDate.getTime())) throw new Error('Select a valid delivery date.');
      await createDeliveryRecord({ farmerUid: account.uid, batchId: input.batchId, warehouseUserId: input.warehouseUserId, deliveryWeight: input.weightKg, deliveryDate: input.deliveryDate });
    },
    updateDeliveryStatus: async (id, status) => {
      if (!account) throw new Error('Sign in before updating a delivery.');
      await updateDeliveryStatusRecord(id, status, account.uid);
    },
    markAlertRead: async (id) => {
      requireFarmer(account);
      if (simulationActive && id.startsWith('SIM-INSPECTION-')) {
        setSimulationAlertRead(true);
        return;
      }
      await markAlertReadRecord(id, account.uid);
    },
  }), [account, alerts, batches, deliveries, error, loading, readings, simulationActive, simulationScenario, warehouses]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function latestByBatch<T>(items: T[], batchId: (item: T) => string, time: (item: T) => number) {
  const result = new Map<string, T>();
  items.forEach((item) => { const id = batchId(item); const current = result.get(id); if (!current || time(item) > time(current)) result.set(id, item); });
  return result;
}

function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60); const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

function makeSimulationReadings(batchId: string, temperatures: readonly number[]): Reading[] {
  const end = Date.now();
  return temperatures.map((temperature, index) => ({
    id: `SIM-${batchId}-${index}`,
    batchId,
    temperature,
    recordedAt: new Date(end - (temperatures.length - 1 - index) * 15 * 60_000).toISOString(),
  }));
}

function requireFarmer(account: UserRecord | null): asserts account is UserRecord & { role: 'farmer' } {
  if (!account || account.role !== 'farmer') throw new Error('A Farmer account is required for this action.');
}

export function useSystemData() {
  const value = useContext(Context);
  if (!value) throw new Error('useSystemData must be used inside SystemDataProvider');
  return value;
}
