import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'farmer' | 'warehouse';
export type DryingStatus = 'GOOD' | 'NOT GOOD' | 'BAD TIME';
export type BatchStatus = 'active' | 'completed';
export type DeliveryStatus = 'Scheduled' | 'In Transit' | 'Received' | 'Cancelled';

export type UserRecord = {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  warehouseName?: string;
};

export type CopraBatchRecord = {
  batchId: string;
  displayCode?: string;
  createdBy: string;
  batchDate: Timestamp;
  batchStatus: BatchStatus;
  completedAt?: Timestamp;
  completedBy?: string;
};

export type MonitoringRecord = {
  monitoringId: string;
  batchId: string;
  temperature: number;
  dryingStatus: DryingStatus | null;
  estimatedTimeRemaining: number | null;
  recordedAt: Timestamp;
};

export type WeightRecord = {
  weightId: string;
  batchId: string;
  weight: number;
  recordedAt: Timestamp;
};

export type AlertRecord = {
  alertId: string;
  batchId: string;
  alertType: string;
  alertMessage: string;
  alertDateTime: Timestamp;
  isRead: boolean;
  readAt: Timestamp | null;
};

export type DeliveryRecord = {
  deliveryId: string;
  displayCode?: string;
  batchId: string;
  warehouseUserId: string;
  createdBy: string;
  updatedBy: string | null;
  deliveryWeight: number;
  deliveryDate: Timestamp;
  deliveryStatus: DeliveryStatus;
};

export type WarehouseOption = Pick<UserRecord, 'uid' | 'email' | 'displayName' | 'warehouseName'>;
