import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { Card, commonStyles, DataStateNotice, formatAppDate, palette, SectionHeading, SectionTitle, StatusPill, TemperatureDisplay } from '@/components/copra/ScopeUI';
import { useSystemData } from '@/components/copra/systemData';
import { READING_FRESHNESS_MINUTES } from '@/config/monitoring';
import { useIotSessionData } from '@/hooks/use-iot-session-data';
import { calculateIotSessionTiming, formatIotElapsedDuration, getIotSessionLifecycle } from '@/services/iotAutoBatch';

export default function DashboardFarmer() {
  const { batches, alerts, deliveries, loading, error } = useSystemData();
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const batch = batches.find((item) => item.lifecycle === 'active');
  const { readings: iotReadings, session: iotSession, firstReading, validation: iotValidation, loading: iotLoading, error: iotError } = useIotSessionData(batch?.iotSessionId, 20);
  const reading = iotReadings.at(-1);
  const latestActionableAlert = [...alerts].filter((item) => !item.read).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const deliveryCounts = {
    Scheduled: deliveries.filter((item) => item.status === 'Scheduled').length,
    'In Transit': deliveries.filter((item) => item.status === 'In Transit').length,
    Received: deliveries.filter((item) => item.status === 'Received').length,
  };
  const progress = batch && !batch.iotSessionId ? getEstimatedProgress(batch.elapsed, batch.remaining) : null;
  const readingTime = reading ? new Date(reading.timestamp).getTime() : Number.NaN;
  const sessionFinished = getIotSessionLifecycle(iotSession) === 'Finished';
  const cookingStartedAt = iotSession?.startTime ?? firstReading?.timestamp;
  const cookingTiming = cookingStartedAt && reading ? calculateIotSessionTiming({ startedAt: cookingStartedAt, latestReadingAt: reading.timestamp, session: iotSession, nowMs: currentTime, staleAfterMs: READING_FRESHNESS_MINUTES * 60_000 }) : null;
  const elapsedLabel = cookingTiming?.mode === 'stale' ? 'Last recorded duration' : cookingTiming?.mode === 'finished' ? 'Final cooking duration' : 'Elapsed cooking time';
  const elapsedValue = cookingTiming ? formatIotElapsedDuration(cookingTiming.elapsedMs) : 'UNAVAILABLE';
  const readingAgeMinutes = Number.isFinite(readingTime) ? (currentTime - readingTime) / 60_000 : null;
  const readingTimestampInFuture = readingAgeMinutes !== null && readingAgeMinutes < 0;
  const readingIsRecent = readingAgeMinutes !== null && readingAgeMinutes >= 0 && readingAgeMinutes <= READING_FRESHNESS_MINUTES;
  const readingIsStale = readingAgeMinutes !== null && readingAgeMinutes > READING_FRESHNESS_MINUTES;
  const emptyTitle = !batch ? 'No active batch' : !batch.iotSessionId ? 'IoT session not linked' : iotError ? 'IoT session unavailable' : iotValidation.invalidTimestampCount ? 'Invalid IoT timestamps' : 'Waiting for IoT readings';
  const emptyMessage = !batch ? 'Create a batch before starting IoT monitoring.' : !batch.iotSessionId ? 'Open Batch Details and explicitly link the session created by the physical IoT device.' : iotError ? iotError.message : iotValidation.invalidTimestampCount ? `${iotValidation.invalidTimestampCount} temperature reading${iotValidation.invalidTimestampCount === 1 ? '' : 's'} were rejected because the source timestamps are not valid calendar dates. Check the IoT device clock.` : 'The linked session has not uploaded a valid temperature reading yet.';

  useEffect(() => {
    const refresh = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(refresh);
  }, []);

  const openMonitoring = (batchId?: string) => router.push({ pathname: '/(farmer)/monitor', params: batchId ? { batchId } : {} } as never);

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Copra-Alert" subtitle="Farm Producer Dashboard" profileRoute="/(farmer)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading || iotLoading} error={error || iotError?.message || null} />
      <View style={styles.headingRow}><View style={{ flex: 1 }}><SectionHeading title="Drying Overview" /></View></View>
      <TouchableOpacity activeOpacity={0.8} onPress={() => openMonitoring(batch?.id)}><Card style={styles.primaryCard}>
        <View style={styles.primaryTop}><View style={styles.conditionCopy}><Text style={styles.overline}>ACTIVE BATCH</Text><Text numberOfLines={1} style={styles.batchId}>{batch?.displayCode ?? 'No active batch'}</Text></View>{reading && batch ? <StatusPill value={batch.status} prominent /> : null}</View>
        {reading ? <><View style={styles.monitoringRow}><View style={styles.temperatureBlock}><Text style={styles.valueLabel}>{readingIsRecent && !sessionFinished ? 'Latest temperature' : 'Last recorded temperature'}</Text><TemperatureDisplay value={reading.temperatureC} /></View><View style={styles.primaryDivider} /><View style={styles.remainingBlock}><Ionicons name="time-outline" size={18} color={palette.green} /><Text style={styles.valueLabel}>Estimated remaining</Text><Text style={styles.remaining}>{batch?.remaining ?? 'Unavailable'}</Text></View></View><View style={styles.readingMeta}><View style={[styles.readingDot, { backgroundColor: readingIsRecent && !sessionFinished ? palette.green : palette.muted }]} /><Text style={styles.readingMetaText}>Last reading: {formatAppDate(reading.timestamp)}</Text></View>{iotValidation.invalidTimestampCount ? <View style={styles.staleNotice}><Ionicons name="warning-outline" size={15} color={palette.warning} /><Text style={styles.staleText}>{iotValidation.invalidTimestampCount} source timestamp{iotValidation.invalidTimestampCount === 1 ? ' is' : 's are'} invalid and excluded</Text></View> : null}{readingIsStale || readingTimestampInFuture || sessionFinished ? <View style={styles.staleNotice}><Ionicons name="warning-outline" size={15} color={palette.warning} /><Text style={styles.staleText}>{sessionFinished ? 'The linked IoT cooking session has finished; these readings are historical' : readingTimestampInFuture ? 'The latest IoT timestamp is ahead of this device clock' : 'Sensor reading may be outdated'}</Text></View> : null}</> : <View style={styles.waitingRow}><View style={styles.waitingIcon}><Ionicons name="radio-outline" size={18} color={palette.green} /></View><View style={{ flex: 1 }}><Text style={styles.waitingTitle}>{emptyTitle}</Text><Text style={styles.waitingText}>{emptyMessage}</Text></View></View>}
        {reading && progress !== null ? <View style={styles.progressBlock}><View style={styles.progressHeader}><Text style={styles.progressLabel}>Estimated drying progress</Text><Text style={styles.progressPercent}>{progress}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View></View> : null}
        <View style={styles.secondaryRow}><View style={styles.timingItem}><Text style={styles.secondaryLabel}>Cooking started</Text><Text style={styles.secondaryValue}>{cookingTiming ? formatAppDate(cookingTiming.startedAt) : 'UNAVAILABLE'}</Text></View><View style={styles.timingDivider} /><View style={styles.timingItem}><Text style={styles.secondaryLabel}>{elapsedLabel}</Text><Text style={styles.secondaryValue}>{elapsedValue}</Text></View><Ionicons name="chevron-forward" size={18} color={palette.muted} /></View>
      </Card></TouchableOpacity>

      <SectionTitle title="Needs attention" action="All alerts" onAction={() => router.push('/(farmer)/alerts' as never)} />
      {latestActionableAlert ? <TouchableOpacity activeOpacity={0.76} onPress={() => openMonitoring(latestActionableAlert.batchId)}><Card style={styles.alertCard}><View style={styles.alert}><View style={styles.alertIcon}><Ionicons name="warning-outline" size={17} color={palette.warning} /></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.alertTitle}>{latestActionableAlert.title}</Text><Text style={styles.alertMeta}>{latestActionableAlert.batchDisplayCode}</Text><Text numberOfLines={2} style={styles.alertMessage}>{latestActionableAlert.description}</Text></View><Ionicons name="chevron-forward" size={17} color={palette.muted} /></View></Card></TouchableOpacity> : <Card style={styles.clearCard}><Ionicons name="checkmark-circle-outline" size={18} color={palette.green} /><Text style={styles.clearText}>No alerts requiring attention</Text></Card>}

      <SectionTitle title="Delivery summary" action="Manage" onAction={() => router.push('/(farmer)/supply' as never)} />
      <TouchableOpacity activeOpacity={0.78} onPress={() => router.push('/(farmer)/supply' as never)}><Card style={styles.deliveryCard}><View style={styles.deliveryStats}>{Object.entries(deliveryCounts).map(([label, count], index) => <View key={label} style={[styles.deliveryStat, index > 0 && styles.deliveryDivider]}><Text style={styles.deliveryCount}>{count}</Text><Text style={styles.deliveryLabel}>{label}</Text></View>)}</View><View style={styles.deliveryLink}><Text style={styles.deliveryLinkText}>View delivery records</Text><Ionicons name="arrow-forward" size={16} color={palette.green} /></View></Card></TouchableOpacity>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, heading: { fontSize: 22, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }, overviewText: { color: palette.muted, marginTop: 2, fontSize: 13 }, primaryCard: { padding: 17, borderColor: '#C8DCCF' }, primaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, conditionCopy: { flex: 1 }, overline: { color: palette.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.7 }, batchId: { color: palette.ink, fontSize: 16, fontWeight: '600', marginTop: 2 }, waitingRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11, marginVertical: 15, padding: 12, borderRadius: 12, backgroundColor: '#F7FAF7', borderWidth: 1, borderColor: palette.line }, waitingIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center' }, waitingTitle: { color: palette.ink, fontSize: 14, fontWeight: '700' }, waitingText: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, monitoringRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 20, marginBottom: 12 }, temperatureBlock: { flex: 1.2, justifyContent: 'center' }, remainingBlock: { flex: 1, justifyContent: 'center', gap: 4 }, primaryDivider: { width: 1, backgroundColor: palette.line, marginHorizontal: 15 }, valueLabel: { color: palette.muted, fontSize: 12, fontWeight: '500' }, remaining: { color: palette.ink, fontSize: 20, fontWeight: '700', lineHeight: 25 }, readingMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }, readingDot: { width: 7, height: 7, borderRadius: 4 }, readingMetaText: { flex: 1, color: palette.muted, fontSize: 10 }, staleNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 13, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: '#FFF0D5' }, staleText: { flex: 1, color: palette.warning, fontSize: 10, fontWeight: '700' }, progressBlock: { marginBottom: 14 }, progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }, progressLabel: { color: palette.muted, fontSize: 12, fontWeight: '500' }, progressPercent: { color: palette.greenDark, fontSize: 13, fontWeight: '700' }, progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#E4ECE6', overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 4, backgroundColor: palette.green }, secondaryRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F7FAF7', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8 }, timingItem: { flex: 1, minWidth: 0 }, timingDivider: { width: 1, alignSelf: 'stretch', backgroundColor: palette.line }, secondaryLabel: { color: palette.muted, fontSize: 9 }, secondaryValue: { color: palette.ink, fontSize: 11, fontWeight: '600', marginTop: 2, lineHeight: 15 }, alertCard: { padding: 11 }, alert: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 }, alertIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF0D5', alignItems: 'center', justifyContent: 'center' }, alertTitle: { color: palette.ink, fontSize: 14, fontWeight: '700' }, alertMessage: { color: palette.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }, alertMeta: { color: palette.green, fontSize: 10, fontWeight: '600', marginTop: 2 }, clearCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11 }, clearText: { color: palette.muted, fontSize: 13 }, deliveryCard: { paddingBottom: 10 }, deliveryStats: { flexDirection: 'row' }, deliveryStat: { flex: 1, alignItems: 'center', paddingVertical: 4 }, deliveryDivider: { borderLeftWidth: 1, borderLeftColor: palette.line }, deliveryCount: { fontSize: 22, color: palette.greenDark, fontWeight: '700' }, deliveryLabel: { color: palette.muted, fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center' }, deliveryLink: { borderTopWidth: 1, borderTopColor: palette.line, marginTop: 10, paddingTop: 9, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }, deliveryLinkText: { color: palette.green, fontSize: 12, fontWeight: '700' },
});

function getEstimatedProgress(elapsed: string, remaining: string) {
  const elapsedMinutes = parseDurationMinutes(elapsed);
  const remainingMinutes = parseDurationMinutes(remaining);
  if (elapsedMinutes === null || remainingMinutes === null || elapsedMinutes + remainingMinutes <= 0) return null;
  return Math.max(0, Math.min(100, Math.round(elapsedMinutes / (elapsedMinutes + remainingMinutes) * 100)));
}

function parseDurationMinutes(value: string) {
  if (/-\s*\d/.test(value)) return null;
  const days = value.match(/(\d+(?:\.\d+)?)\s*day/i);
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/i);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*min/i);
  if (!days && !hours && !minutes) return null;
  const total = (days ? Number(days[1]) * 1440 : 0) + (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
  return Number.isFinite(total) && total >= 0 ? total : null;
}
