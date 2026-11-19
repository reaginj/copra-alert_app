import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePickerField from '@/components/copra/DatePickerField';
import Header from '@/components/copra/Header';
import IoTSessionLinker from '@/components/copra/IoTSessionLinker';
import { Card, commonStyles, DataStateNotice, EmptyState, FilterPills, formatAppDate, PageActionButton, palette, SectionHeading, StatusPill } from '@/components/copra/ScopeUI';
import { Batch, useSystemData } from '@/components/copra/systemData';
import { useIotSessionData } from '@/hooks/use-iot-session-data';

const filters = ['All', 'Current', 'Previous'] as const;
type BatchFilter = typeof filters[number];
type IoTSessionState = 'Active' | 'Finished' | 'Unknown' | 'Unavailable';

function getIoTSessionState(session: { status?: string; finishTime?: string } | null): IoTSessionState {
  if (!session) return 'Unavailable';
  const status = session.status?.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (session.finishTime || status === 'COMPLETED' || status === 'FINISHED') return 'Finished';
  if (status === 'ACTIVE' || status === 'RUNNING' || status === 'IN_PROGRESS') return 'Active';
  return 'Unknown';
}

export default function Batches() {
  const { batches, createBatch, completeBatch, linkBatchToIotSession, loading, error } = useSystemData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Batch | null>(null);
  const [linkBatch, setLinkBatch] = useState<Batch | null>(null);
  const [filter, setFilter] = useState<BatchFilter>('All');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [latestStartAt, setLatestStartAt] = useState<Date | null>(null);
  const { session: detailIotSession } = useIotSessionData(detail?.iotSessionId, 1);
  const detailIotSessionState = getIoTSessionState(detailIotSession);
  const visibleBatches = useMemo(() => batches.filter((batch) => filter === 'All' || (filter === 'Current' ? batch.lifecycle === 'active' : batch.lifecycle === 'completed')), [batches, filter]);

  const close = () => { Keyboard.dismiss(); setOpen(false); };
  const openCreate = () => {
    const openedAt = new Date();
    setStartedAt((current) => current ?? openedAt);
    setLatestStartAt(openedAt);
    setOpen(true);
  };
  const save = async () => {
    if (submittingRef.current || !startedAt) return;
    if (startedAt.getTime() > Date.now()) return Alert.alert('Invalid start time', 'The drying start time cannot be in the future.');
    try {
      submittingRef.current = true;
      setSaving(true);
      await createBatch({ startedAt });
      Keyboard.dismiss(); setOpen(false); setStartedAt(null); setLatestStartAt(null);
      Alert.alert('Batch created', 'The new drying batch is ready for monitoring data.');
    } catch (cause) {
      Alert.alert('Unable to create batch', cause instanceof Error ? cause.message : 'Please try again.');
    } finally { submittingRef.current = false; setSaving(false); }
  };

  const confirmCompletion = (batch: Batch) => {
    if (completingId) return;
    Alert.alert(
      'Complete Drying Batch?',
      'Have you physically checked the copra and confirmed that the drying process is finished? Completing this batch will move it to Previous Batches.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Batch',
          onPress: async () => {
            try {
              setCompletingId(batch.id);
              await completeBatch(batch.id);
              setDetail(null);
              Alert.alert('Batch completed', `${batch.displayCode} was moved to Previous Batches.`);
            } catch (cause) {
              Alert.alert('Unable to complete batch', cause instanceof Error ? cause.message : 'Please try again.');
            } finally {
              setCompletingId(null);
            }
          },
        },
      ],
    );
  };

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Drying Batches" subtitle="Current and previous batch records" profileRoute="/(farmer)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <View style={styles.pageHead}><SectionHeading title="Batch Records" /><PageActionButton label="New Batch" onPress={openCreate} /></View>
      <FilterPills values={filters} selected={filter} onSelect={setFilter} />
      {visibleBatches.length ? visibleBatches.map((batch) => { const current = batch.lifecycle === 'active'; const lifecycle = current ? 'ACTIVE' : 'COMPLETED'; return <TouchableOpacity key={batch.id} activeOpacity={0.76} onPress={() => setDetail(batch)}>
        <Card style={styles.batchCard}><View style={styles.top}><View style={styles.idCopy}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.id}>{batch.displayCode}</Text><View style={styles.lifecycleRow}><View style={[styles.lifecycleDot, !current && styles.lifecycleDotDone]} /><Text style={[styles.lifecycle, !current && styles.lifecycleDone]}>{lifecycle}</Text></View></View><StatusPill value={batch.status} /></View><View style={styles.compactGrid}><View style={styles.compactItem}><Text style={styles.compactLabel}>Started</Text><Text style={styles.compactValue}>{formatAppDate(batch.startedAt)}</Text></View><View style={styles.compactItem}><Text style={styles.compactLabel}>{current ? 'Status' : 'Completed'}</Text><Text style={styles.compactValue}>{current ? 'In progress' : batch.completedAt ? formatAppDate(batch.completedAt) : 'Not recorded'}</Text></View><Ionicons name="chevron-forward" size={17} color={palette.muted} /></View></Card>
      </TouchableOpacity>; }) : <EmptyState icon="layers-outline" title={`No ${filter.toLowerCase()} batches`} message="No batch records match this filter." />}
    </ScrollView>

    <Modal visible={Boolean(detail)} transparent animationType="slide" onRequestClose={() => setDetail(null)}><Pressable style={styles.detailOverlay} onPress={() => setDetail(null)}><Pressable style={styles.detailSheet} onPress={() => undefined}><View style={styles.handle} /><View style={styles.modalHead}><View style={{ flex: 1 }}><Text style={styles.modalTitle}>Batch details</Text><Text style={styles.modalSubtitle}>{detail?.displayCode}</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setDetail(null)}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>{detail ? <View style={styles.detailBody}><View style={styles.detailStatus}><Text style={styles.detailStatusLabel}>Computed condition</Text><StatusPill value={detail.status} /></View>{detail.iotSessionId ? <><View style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>IoT session</Text><Text selectable style={commonStyles.detailValue}>{detail.iotSessionId}</Text></View><View style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>IoT session state</Text><Text style={commonStyles.detailValue}>{detailIotSessionState}</Text></View></> : null}{[['Batch lifecycle', detail.lifecycle === 'active' ? 'Active · In progress' : 'Completed'], ['Drying started', formatAppDate(detail.startedAt)], ...(detail.completedAt ? [['Completed', formatAppDate(detail.completedAt)]] : []), ['Elapsed time', detail.elapsed], [detail.lifecycle === 'active' ? 'Estimated remaining' : 'Drying status', detail.remaining]].map(([label, value]) => <View key={label} style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>{label}</Text><Text style={commonStyles.detailValue}>{value}</Text></View>)}{detail.iotSessionId && detailIotSessionState === 'Finished' && detail.lifecycle === 'active' ? <View style={styles.sessionNotice}><Ionicons name="information-circle-outline" size={18} color={palette.green} /><Text style={styles.sessionNoticeText}>The IoT cooking session has finished. This batch remains active until you manually complete it.</Text></View> : null}{detail.lifecycle === 'active' && !detail.iotSessionId ? <TouchableOpacity style={styles.linkButton} onPress={() => { setLinkBatch(detail); setDetail(null); }}><Ionicons name="link-outline" size={18} color={palette.green} /><Text style={styles.linkButtonText}>Link IoT Session</Text></TouchableOpacity> : null}{detail.lifecycle === 'active' ? <TouchableOpacity style={[styles.completeButton, completingId === detail.id && styles.disabledButton]} disabled={Boolean(completingId)} activeOpacity={0.82} onPress={() => confirmCompletion(detail)}><Ionicons name="checkmark-circle-outline" size={19} color={palette.white} /><Text style={styles.completeButtonText}>{completingId === detail.id ? 'Completing…' : 'Complete Batch'}</Text></TouchableOpacity> : null}</View> : null}</Pressable></Pressable></Modal>

    <IoTSessionLinker batch={linkBatch} batches={batches} onClose={() => setLinkBatch(null)} onLink={linkBatchToIotSession} />

    <Modal visible={open} animationType="slide" transparent onRequestClose={close}><KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}><TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}><View style={styles.dismissArea} /></TouchableWithoutFeedback><View style={styles.sheet}><View style={styles.handle} /><View style={styles.modalHead}><View><Text style={styles.modalTitle}>Create drying batch</Text><Text style={styles.modalSubtitle}>Add the drying start date and time</Text></View><TouchableOpacity style={styles.closeButton} onPress={close}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View><ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{startedAt && latestStartAt ? <View><Text style={commonStyles.label}>Drying start date and time</Text><DatePickerField value={startedAt} onChange={setStartedAt} mode="datetime" maximumDate={latestStartAt} /></View> : null}<TouchableOpacity style={commonStyles.primary} onPress={save} activeOpacity={0.82} disabled={saving || !startedAt}><Text style={commonStyles.primaryText}>{saving ? 'Saving…' : 'Create batch'}</Text></TouchableOpacity><TouchableOpacity style={styles.cancel} onPress={close}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity></ScrollView></View></KeyboardAvoidingView></Modal>
  </View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, pageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, pageCopy: { flex: 1 }, pageTitle: { color: palette.ink, fontSize: 20, fontWeight: '700' }, pageSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, batchCard: { padding: 13 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, idCopy: { flex: 1 }, id: { fontWeight: '700', color: palette.ink, fontSize: 17 }, lifecycleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }, lifecycleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.green }, lifecycleDotDone: { backgroundColor: palette.muted }, lifecycle: { color: palette.green, fontWeight: '700', fontSize: 9, letterSpacing: 0.4 }, lifecycleDone: { color: palette.muted }, compactGrid: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.line }, compactItem: { flex: 1 }, compactLabel: { color: palette.muted, fontSize: 11, fontWeight: '500' }, compactValue: { color: palette.ink, fontSize: 12, fontWeight: '600', marginTop: 3, lineHeight: 16 }, detailOverlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, detailSheet: { backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 28 }, detailBody: { marginHorizontal: 16, backgroundColor: palette.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: palette.line }, detailStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: palette.line }, detailStatusLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' }, sessionNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 10, borderRadius: 11, backgroundColor: palette.paleGreen }, sessionNoticeText: { flex: 1, color: palette.greenDark, fontSize: 11, lineHeight: 16, fontWeight: '600' }, linkButton: { minHeight: 46, marginTop: 14, borderRadius: 11, borderWidth: 1, borderColor: palette.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 14 }, linkButtonText: { color: palette.green, fontSize: 14, fontWeight: '700' }, completeButton: { minHeight: 48, marginTop: 12, borderRadius: 12, backgroundColor: palette.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 }, completeButtonText: { color: palette.white, fontSize: 15, fontWeight: '700' }, disabledButton: { opacity: 0.55 }, overlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, dismissArea: { flex: 1 }, sheet: { maxHeight: '82%', backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, gap: 12 }, modalTitle: { fontSize: 20, fontWeight: '700', color: palette.ink }, modalSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' }, form: { paddingHorizontal: 20, paddingBottom: 28, gap: 16 }, optional: { color: palette.muted, fontWeight: '500' }, cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: palette.muted, fontWeight: '700' }, keyboardBar: { minHeight: 45, backgroundColor: '#F2F2F2', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C7C7C7', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 16 }, doneButton: { paddingHorizontal: 8, paddingVertical: 9 }, doneText: { color: palette.green, fontSize: 16, fontWeight: '700' },
});
