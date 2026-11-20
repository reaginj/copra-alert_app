import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  IOT_AUTO_BATCH_DETECTION_ENABLED,
  IOT_AUTO_BATCH_MAX_FUTURE_SKEW_MS,
  IOT_AUTO_BATCH_MIN_VALID_READINGS,
  IOT_AUTO_BATCH_WRITES_ENABLED,
} from '@/config/iotAutoBatch';
import { READING_FRESHNESS_MINUTES } from '@/config/monitoring';
import { useSystemData } from '@/components/copra/systemData';
import {
  canRunReadOnlyIotAutoBatchCoordinator,
  createReadOnlyIotAutoBatchCoordinator,
  type IoTAutoBatchContext,
  type IoTAutoBatchDiagnostic,
  type ReadOnlyIotAutoBatchCoordinator,
} from '@/services/iotAutoBatch';
import { detectNewIotSessions } from '@/services/iotMonitoring';
import { createIotLinkedBatchRecord } from '@/services/copraFirestore';

const REASON_LABELS = {
  'unauthorized-farmer': 'Farmer authorization unavailable',
  'active-batch-exists': 'an active batch already exists',
  'no-eligible-session': 'no new eligible session',
  'ambiguous-sessions': 'multiple eligible sessions detected',
} as const;

export function IotAutoBatchCoordinator() {
  const { accountUid, role, batchesLoaded, batches } = useSystemData();
  const [diagnostic, setDiagnostic] = useState<IoTAutoBatchDiagnostic>({ state: 'baselining' });
  const coordinatorRef = useRef<ReadOnlyIotAutoBatchCoordinator | null>(null);
  const context = useMemo<Omit<IoTAutoBatchContext, 'nowMs'>>(() => ({
    farmerUid: accountUid,
    role,
    staleAfterMs: READING_FRESHNESS_MINUTES * 60_000,
    maxFutureSkewMs: IOT_AUTO_BATCH_MAX_FUTURE_SKEW_MS,
    minValidReadings: IOT_AUTO_BATCH_MIN_VALID_READINGS,
    hasConflictingActiveBatch: batches.some((batch) => batch.lifecycle === 'active'),
    associatedSessionIds: new Set(batches.flatMap((batch) => batch.iotSessionId ? [batch.iotSessionId] : [])),
  }), [accountUid, batches, role]);
  const contextRef = useRef(context);

  const shouldRun = canRunReadOnlyIotAutoBatchCoordinator({
    detectionEnabled: IOT_AUTO_BATCH_DETECTION_ENABLED,
    farmerUid: accountUid,
    role,
    batchesLoaded,
  });

  useEffect(() => {
    contextRef.current = context;
    coordinatorRef.current?.refresh();
  }, [context]);

  useEffect(() => {
    if (!shouldRun) return;
    const coordinator = createReadOnlyIotAutoBatchCoordinator({
      source: detectNewIotSessions,
      getContext: () => contextRef.current,
      onDiagnostic: setDiagnostic,
      onEligible: IOT_AUTO_BATCH_WRITES_ENABLED && accountUid ? async (candidate) => createIotLinkedBatchRecord({
        farmerUid: accountUid,
        sessionId: candidate.id,
        batchDate: new Date(candidate.firstReadingAt),
      }) : undefined,
    });
    coordinatorRef.current = coordinator;
    return () => {
      coordinator.stop();
      if (coordinatorRef.current === coordinator) coordinatorRef.current = null;
    };
  }, [accountUid, shouldRun]);

  const label = useMemo(() => formatDiagnostic(diagnostic), [diagnostic]);
  if (!__DEV__ || !IOT_AUTO_BATCH_DETECTION_ENABLED || !shouldRun) return null;

  return (
    <View pointerEvents="none" style={[styles.badge, diagnostic.state === 'eligible' ? styles.eligible : styles.neutral]}>
      <Text numberOfLines={1} style={styles.text}>{label}</Text>
    </View>
  );
}

function formatDiagnostic(diagnostic: IoTAutoBatchDiagnostic) {
  if (diagnostic.state === 'baselining') return 'IoT detector: establishing historical baseline';
  if (diagnostic.state === 'eligible') return `IoT detector: ${diagnostic.sessionId} eligible (read-only)`;
  if (diagnostic.state === 'creating') return `IoT detector: creating batch for ${diagnostic.sessionId}`;
  if (diagnostic.state === 'created') return `IoT detector: ${diagnostic.created ? 'created' : 'confirmed'} batch for ${diagnostic.sessionId}`;
  if (diagnostic.state === 'rejected') return `IoT detector: rejected - ${REASON_LABELS[diagnostic.reason]}`;
  return `IoT detector error: ${diagnostic.message}`;
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 20,
    alignSelf: 'center',
    bottom: 70,
    maxWidth: '90%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(67, 73, 69, 0.88)',
  },
  neutral: { backgroundColor: 'rgba(67, 73, 69, 0.88)' },
  eligible: { backgroundColor: 'rgba(36, 107, 69, 0.92)' },
  text: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
});
