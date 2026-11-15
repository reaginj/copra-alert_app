import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { Card, commonStyles, DataStateNotice, EmptyState, formatAppDate, palette, SectionTitle, StatusPill, TemperatureDisplay } from '@/components/copra/ScopeUI';
import { Reading, useSystemData } from '@/components/copra/systemData';
import { READING_FRESHNESS_MINUTES } from '@/config/monitoring';

const batchFilters = ['All', 'Active', 'Completed'] as const;

export default function Monitoring() {
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { batches, readings, loading, error } = useSystemData();
  const batchId = params.batchId && batches.some((item) => item.id === params.batchId) ? params.batchId : batches.find((item) => item.lifecycle === 'active')?.id ?? batches[0]?.id;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [batchSearch, setBatchSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<(typeof batchFilters)[number]>('All');
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const batch = batches.find((item) => item.id === batchId);
  const selectableBatches = useMemo(() => [...batches]
    .filter((item) => batchFilter === 'All' || (batchFilter === 'Active' ? item.lifecycle === 'active' : item.lifecycle === 'completed'))
    .filter((item) => `${item.displayCode} ${item.id} ${formatAppDate(item.startedAt, false)}`.toLowerCase().includes(batchSearch.trim().toLowerCase()))
    .sort((left, right) => Number(right.lifecycle === 'active') - Number(left.lifecycle === 'active') || new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()), [batchFilter, batchSearch, batches]);
  const history = useMemo(() => readings.filter((item) => item.batchId === batchId).slice().sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()), [batchId, readings]);
  const latest = history.at(-1);
  const latestTime = latest?.recordedAt ? new Date(latest.recordedAt) : null;
  const validTimestamp = latestTime && !Number.isNaN(latestTime.getTime());
  const ageMinutes = validTimestamp ? (currentTime - latestTime.getTime()) / 60000 : null;
  const isRecent = ageMinutes !== null && ageMinutes >= 0 && ageMinutes <= READING_FRESHNESS_MINUTES;
  const isOutdated = ageMinutes !== null && ageMinutes > READING_FRESHNESS_MINUTES;

  useEffect(() => {
    const refresh = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(refresh);
  }, []);

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Monitoring" subtitle="Computation-based drying status" profileRoute="/(farmer)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <TouchableOpacity style={styles.selector} activeOpacity={0.78} onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel="Select drying batch">
        <View style={styles.selectorCopy}><View style={styles.selectorLabelRow}><Text style={styles.selectorLabel}>DRYING BATCH</Text>{batch ? <Text style={styles.lifecycle}>{batch.lifecycle === 'active' ? 'ACTIVE' : 'PREVIOUS'}</Text> : null}</View><Text numberOfLines={1} style={styles.selectorValue}>{batch?.displayCode ?? 'Choose a batch'}</Text></View>
        <Ionicons name="chevron-down" size={19} color={palette.muted} />
      </TouchableOpacity>

      {!batch ? <EmptyState icon="radio-outline" title="Waiting for sensor data" message="No readings have been received. Create a batch when you are ready to connect the ESP32 monitoring device." /> : <>
        {batch.lifecycle === 'completed' ? <View style={styles.completedNotice}><Ionicons name="checkmark-circle-outline" size={19} color={palette.green} /><View style={{ flex: 1 }}><Text style={styles.completedTitle}>Completed batch</Text><Text style={styles.completedText}>Showing historical monitoring records. This is not live monitoring.</Text></View></View> : null}
        {batch.lifecycle === 'active' && isOutdated ? <View style={styles.stale}><Ionicons name="warning-outline" size={19} color={palette.warning} /><View style={{ flex: 1 }}><Text style={styles.staleTitle}>Reading may be outdated</Text><Text style={styles.staleText}>Sensor values may no longer reflect current conditions.</Text></View></View> : null}
        {!latest ? <Card style={styles.sensorEmpty}><View style={styles.sensorEmptyIcon}><Ionicons name="radio-outline" size={24} color={palette.green} /></View><Text style={styles.sensorEmptyTitle}>Waiting for sensor data</Text><Text style={styles.sensorEmptyText}>No readings have been received for this batch. The ESP32 monitoring device may not be connected yet.</Text><View style={styles.unavailableGrid}><View style={styles.unavailableItem}><Text style={styles.summaryLabel}>Drying status</Text><Text style={styles.unavailableValue}>Unavailable</Text></View><View style={styles.unavailableItem}><Text style={styles.summaryLabel}>Estimated remaining</Text><Text style={styles.unavailableValue}>Unavailable</Text></View></View></Card> : <Card style={styles.monitorCard}>
          <View style={styles.top}><View style={{ flex: 1, minWidth: 0 }}><Text style={styles.eyebrow}>{batch.lifecycle === 'active' ? 'LATEST TEMPERATURE' : 'LATEST RECORDED TEMPERATURE'}</Text><TemperatureDisplay value={latest.temperature} size="monitoring" /></View>{batch.status ? <StatusPill value={batch.status} prominent /> : null}</View>
          <View style={styles.divider} />
          <View style={styles.summaryGrid}><View style={styles.summaryItem}><Text style={styles.summaryLabel}>Elapsed</Text><Text style={styles.summaryValue}>{batch.elapsed}</Text></View><View style={styles.summaryItem}><Text style={styles.summaryLabel}>{batch.lifecycle === 'active' ? 'Estimated remaining' : 'Completed'}</Text><Text style={styles.summaryValue}>{batch.lifecycle === 'active' ? batch.remaining : batch.completedAt ? formatAppDate(batch.completedAt) : 'Completion time unavailable'}</Text></View></View>
          <View style={styles.freshnessRow}><View style={[styles.freshnessDot, { backgroundColor: batch.lifecycle === 'active' && isRecent ? palette.green : palette.muted }]} /><Text style={styles.receivedText}>{batch.lifecycle === 'active' ? 'Last received' : 'Last recorded'}: {validTimestamp ? formatAppDate(latest.recordedAt) : 'Timestamp unavailable'}</Text></View>
        </Card>}
        <SectionTitle title="Temperature history" />
        {history.length ? <Card><TemperatureLineChart readings={history} /></Card> : <Card style={styles.chartEmpty}><Ionicons name="analytics-outline" size={22} color={palette.muted} /><Text style={styles.chartEmptyText}>No temperature readings available</Text></Card>}
      </>}
    </ScrollView>

    <Modal visible={pickerOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setPickerOpen(false)}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><Pressable style={styles.pickerDismiss} onPress={() => setPickerOpen(false)} /><View style={styles.sheet}>
        <View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>Select a batch</Text><Text style={styles.sheetSubtitle}>Active batches appear first</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setPickerOpen(false)}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
        <View style={styles.batchSearch}><Ionicons name="search-outline" size={18} color={palette.muted} /><TextInput value={batchSearch} onChangeText={setBatchSearch} placeholder="Search batch number or date" placeholderTextColor="#7B847D" style={styles.batchSearchInput} /></View>
        <View style={styles.batchFilters}>{batchFilters.map((item) => <TouchableOpacity key={item} style={[styles.batchFilter, batchFilter === item && styles.batchFilterActive]} onPress={() => setBatchFilter(item)}><Text style={[styles.batchFilterText, batchFilter === item && styles.batchFilterTextActive]}>{item}</Text></TouchableOpacity>)}</View>
        <FlatList data={selectableBatches} keyExtractor={(item) => item.id} style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled" renderItem={({ item }) => { const selected = item.id === batchId; return <TouchableOpacity style={[styles.option, selected && styles.optionSelected]} onPress={() => { router.setParams({ batchId: item.id }); setBatchSearch(''); setPickerOpen(false); }}><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View><View style={{ flex: 1 }}><View style={styles.optionTitleRow}><Text numberOfLines={1} style={[styles.optionId, selected && styles.optionIdSelected]}>{item.displayCode}</Text><Text style={styles.optionLifecycle}>{item.lifecycle === 'active' ? 'ACTIVE' : 'COMPLETED'}</Text></View><Text style={styles.optionMeta}>{formatAppDate(item.startedAt)}</Text></View><StatusPill value={item.status} /></TouchableOpacity>; }} ListEmptyComponent={<Text style={styles.noBatchResults}>No matching batches</Text>} />
      </View></KeyboardAvoidingView>
    </Modal>
  </View>;
}

function TemperatureLineChart({ readings }: { readings: Reading[] }) {
  const [width, setWidth] = useState(0);
  const values = readings.map((item) => item.temperature);
  const rawMin = Math.min(...values); const rawMax = Math.max(...values);
  const min = Math.floor(rawMin - 1); const max = Math.ceil(rawMax + 1); const range = Math.max(1, max - min);
  const plotLeft = 34; const plotRight = 8; const plotTop = 14; const plotHeight = 112; const plotWidth = Math.max(1, width - plotLeft - plotRight);
  const points = readings.map((item, index) => ({ x: plotLeft + (readings.length === 1 ? plotWidth / 2 : index / (readings.length - 1) * plotWidth), y: plotTop + (max - item.temperature) / range * plotHeight, item }));
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  return <View style={styles.chart} onLayout={onLayout}>
    <Text style={[styles.axisLabel, { top: plotTop - 7 }]}>{max}°</Text><Text style={[styles.axisLabel, { top: plotTop + plotHeight - 7 }]}>{min}°</Text>
    {[0, 0.5, 1].map((ratio) => <View key={ratio} style={[styles.gridLine, { left: plotLeft, right: plotRight, top: plotTop + ratio * plotHeight }]} />)}
    {width > 0 ? <>{points.slice(0, -1).map((point, index) => { const next = points[index + 1]; const dx = next.x - point.x; const dy = next.y - point.y; const length = Math.sqrt(dx * dx + dy * dy); const angle = Math.atan2(dy, dx) * 180 / Math.PI; return <View key={`line-${point.item.id}`} style={[styles.lineSegment, { width: length, left: (point.x + next.x) / 2 - length / 2, top: (point.y + next.y) / 2, transform: [{ rotate: `${angle}deg` }] }]} />; })}{points.map((point) => <View key={point.item.id} style={[styles.chartPoint, { left: point.x - 4, top: point.y - 4 }]} />)}</> : null}
    {points.length ? <><Text numberOfLines={1} style={[styles.timeLabel, { left: plotLeft, textAlign: 'left' }]}>{new Date(points[0].item.recordedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>{points.length > 2 ? <Text numberOfLines={1} style={[styles.timeLabel, { left: width / 2 - 30, textAlign: 'center' }]}>{new Date(points[Math.floor(points.length / 2)].item.recordedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text> : null}<Text numberOfLines={1} style={[styles.timeLabel, { right: plotRight, textAlign: 'right' }]}>{new Date(points.at(-1)!.item.recordedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></> : null}
  </View>;
}

const styles = StyleSheet.create({
  pickerDismiss: { flex: 1 },
  batchSearch: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#CDD2CB', borderRadius: 12, backgroundColor: palette.white },
  batchSearchInput: { flex: 1, paddingVertical: 10, color: palette.ink, fontSize: 14 },
  batchFilters: { flexDirection: 'row', gap: 7, paddingHorizontal: 16, paddingBottom: 10 },
  batchFilter: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line, borderRadius: 18, backgroundColor: palette.white },
  batchFilterActive: { backgroundColor: palette.green, borderColor: palette.green },
  batchFilterText: { color: palette.muted, fontSize: 11, fontWeight: '800' },
  batchFilterTextActive: { color: palette.white },
  noBatchResults: { color: palette.muted, textAlign: 'center', paddingVertical: 24, fontSize: 13 },
  safe: { backgroundColor: palette.greenDark }, selector: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#213126', shadowOpacity: 0.04, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, selectorIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center' }, selectorCopy: { flex: 1 }, selectorLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, selectorLabel: { color: palette.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 }, lifecycle: { color: palette.green, fontSize: 8, fontWeight: '900', backgroundColor: palette.paleGreen, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }, selectorValue: { color: palette.ink, fontSize: 15, fontWeight: '900', marginTop: 2 }, stale: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: '#FFF0D5', borderRadius: 12, padding: 11 }, staleTitle: { fontWeight: '900', color: palette.warning, fontSize: 13 }, staleText: { color: '#715326', fontSize: 11, marginTop: 2 }, completedNotice: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: palette.paleGreen, borderRadius: 12, padding: 11 }, completedTitle: { fontWeight: '900', color: palette.greenDark, fontSize: 13 }, completedText: { color: palette.muted, fontSize: 11, marginTop: 2, lineHeight: 16 }, sensorEmpty: { padding: 18, alignItems: 'center' }, sensorEmptyIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, sensorEmptyTitle: { color: palette.ink, fontSize: 16, fontWeight: '900' }, sensorEmptyText: { color: palette.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 290, marginTop: 5 }, unavailableGrid: { width: '100%', flexDirection: 'row', gap: 8, marginTop: 15 }, unavailableItem: { flex: 1, backgroundColor: '#F8FAF7', borderRadius: 11, padding: 10 }, unavailableValue: { color: palette.muted, fontWeight: '800', fontSize: 13, marginTop: 4 }, monitorCard: { padding: 15 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, eyebrow: { color: palette.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 }, temp: { fontSize: 33, fontWeight: '900', color: palette.greenDark, marginTop: 3, letterSpacing: -0.7 }, divider: { height: 1, backgroundColor: palette.line, marginVertical: 13 }, summaryGrid: { flexDirection: 'row', gap: 8 }, summaryItem: { flex: 1, backgroundColor: '#F8FAF7', borderRadius: 11, padding: 10 }, summaryLabel: { color: palette.muted, fontSize: 10, fontWeight: '700' }, summaryValue: { color: palette.ink, fontWeight: '900', fontSize: 14, marginTop: 4 }, freshnessRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 }, freshnessDot: { width: 7, height: 7, borderRadius: 4 }, receivedText: { color: palette.muted, fontSize: 10, flex: 1 }, chartEmpty: { minHeight: 86, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, chartEmptyText: { color: palette.muted, fontSize: 12, fontWeight: '700' }, chart: { height: 158, position: 'relative' }, axisLabel: { position: 'absolute', left: 0, width: 30, color: palette.muted, fontSize: 9, textAlign: 'right' }, gridLine: { position: 'absolute', height: 1, backgroundColor: '#E8EAE5' }, lineSegment: { position: 'absolute', height: 2.5, borderRadius: 2, backgroundColor: palette.green }, chartPoint: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: palette.white, borderWidth: 2.5, borderColor: palette.green }, timeLabel: { position: 'absolute', top: 136, width: 60, color: palette.muted, fontSize: 8 }, chartNote: { fontSize: 10, color: palette.muted, textAlign: 'center', marginTop: 3 }, overlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, sheet: { maxHeight: '72%', backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 24 }, sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 }, sheetTitle: { color: palette.ink, fontSize: 20, fontWeight: '900' }, sheetSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' }, options: { flexGrow: 0 }, optionsContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 }, option: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 14, padding: 12 }, optionSelected: { borderColor: palette.green, backgroundColor: '#F5FAF6' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#BCC3BD', alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: palette.green }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: palette.green }, optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, optionId: { color: palette.ink, fontWeight: '800', fontSize: 13, flexShrink: 1 }, optionIdSelected: { color: palette.greenDark }, optionLifecycle: { color: palette.muted, fontSize: 8, fontWeight: '900' }, optionMeta: { color: palette.muted, fontSize: 10, marginTop: 3 },
});
