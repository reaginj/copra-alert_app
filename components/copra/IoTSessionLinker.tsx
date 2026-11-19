import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { discoverIotSessions, type IoTSessionCandidate } from '@/services/iotMonitoring';
import { EmptyState, formatAppDate, palette } from './ScopeUI';
import { type Batch } from './systemData';

type Props = {
  batch: Batch | null;
  batches: Batch[];
  onClose: () => void;
  onLink: (batchId: string, sessionId: string) => Promise<void>;
};

export default function IoTSessionLinker({ batch, batches, onClose, onLink }: Props) {
  const [sessions, setSessions] = useState<IoTSessionCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!batch) return;
    let active = true;
    const request = setTimeout(() => {
      setLoading(true);
      setError('');
      setSelectedId(null);
      discoverIotSessions()
        .then((items) => { if (active) setSessions(items); })
        .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load IoT sessions.'); })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; clearTimeout(request); };
  }, [batch, reloadKey]);

  const batchStartTime = batch ? Date.parse(batch.startedAt) : Number.NaN;

  const confirmLink = () => {
    if (!batch || !selectedId || linking) return;
    const selected = sessions.find((item) => item.id === selectedId);
    if (!selected) return;
    Alert.alert('Link IoT Session?', `Link ${selected.id} to ${batch.displayCode}?\n\nFirst reading: ${formatAppDate(selected.firstReadingAt)}\nLatest reading: ${formatAppDate(selected.latestReadingAt)}\n\nThis link cannot be replaced in the app.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm Link', onPress: async () => {
        try {
          setLinking(true);
          await onLink(batch.id, selected.id);
          onClose();
          Alert.alert('IoT session linked', `${selected.id} is now associated with ${batch.displayCode}.`);
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : 'Unable to save the IoT session link.';
          Alert.alert('Unable to link session', /permission|insufficient/i.test(message) ? 'Firestore denied this update. The current Security Rules do not yet permit adding an IoT session ID to a batch.' : message);
        } finally { setLinking(false); }
      } },
    ]);
  };

  return <Modal visible={Boolean(batch)} transparent animationType="slide" statusBarTranslucent onRequestClose={linking ? undefined : onClose}>
    <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}><View style={styles.sheet}>
      <View style={styles.handle} /><View style={styles.header}><View style={styles.headerCopy}><Text style={styles.title}>Link IoT Session</Text><Text numberOfLines={1} style={styles.subtitle}>{batch?.displayCode} · Select the physical device session</Text></View><TouchableOpacity style={styles.close} disabled={linking} onPress={onClose}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={18} color={palette.green} /><Text style={styles.noticeText}>Sessions are never linked automatically. Confirm the session ID and reading times before saving.</Text></View>
      {loading ? <View style={styles.state}><ActivityIndicator color={palette.green} /><Text style={styles.stateText}>Loading device sessions…</Text></View> : error ? <View style={styles.errorState}><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retry} onPress={() => setReloadKey((value) => value + 1)}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity></View> : sessions.length ? <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>{sessions.map((session) => {
        const linkedBatch = batches.find((item) => item.iotSessionId === session.id);
        const predatesBatch = Number.isFinite(batchStartTime) && Date.parse(session.latestReadingAt) < batchStartTime;
        const disabled = Boolean(linkedBatch) || predatesBatch;
        const selected = selectedId === session.id;
        return <TouchableOpacity key={session.id} disabled={disabled || linking} activeOpacity={0.78} onPress={() => setSelectedId(session.id)} style={[styles.session, selected && styles.sessionSelected, disabled && styles.sessionDisabled]}><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View><View style={styles.sessionCopy}><Text selectable numberOfLines={1} ellipsizeMode="middle" style={styles.sessionId}>{session.id}</Text><Text style={styles.meta}>First reading: {formatAppDate(session.firstReadingAt)}</Text><Text style={styles.meta}>Latest reading: {formatAppDate(session.latestReadingAt)}</Text><Text style={styles.count}>{session.validReadingCount} valid reading{session.validReadingCount === 1 ? '' : 's'}</Text>{linkedBatch ? <Text style={styles.blocked}>Already linked to {linkedBatch.displayCode}</Text> : predatesBatch ? <Text style={styles.blocked}>Latest reading is before this batch started</Text> : null}</View></TouchableOpacity>;
      })}</ScrollView> : <View style={styles.empty}><EmptyState icon="radio-outline" title="No IoT sessions found" message="Press the physical Start button and wait for the device to upload a valid temperature reading, then try again." /><TouchableOpacity style={styles.retry} onPress={() => setReloadKey((value) => value + 1)}><Text style={styles.retryText}>Refresh</Text></TouchableOpacity></View>}
      <View style={styles.footer}><TouchableOpacity style={styles.cancel} disabled={linking} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[styles.confirm, (!selectedId || linking) && styles.disabled]} disabled={!selectedId || linking} onPress={confirmLink}><Text style={styles.confirmText}>{linking ? 'Linking…' : 'Confirm Session'}</Text></TouchableOpacity></View>
    </View></SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#13251BA6' }, sheet: { maxHeight: '94%', flexShrink: 1, backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 12 }, headerCopy: { flex: 1, minWidth: 0 }, title: { color: palette.ink, fontSize: 20, fontWeight: '800' }, subtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginBottom: 10, padding: 11, borderRadius: 11, backgroundColor: palette.paleGreen }, noticeText: { flex: 1, color: palette.greenDark, fontSize: 11, lineHeight: 16 }, state: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 }, stateText: { color: palette.muted, fontSize: 13, fontWeight: '600' }, errorState: { margin: 16, padding: 15, borderRadius: 13, backgroundColor: '#FBEAE8', gap: 12 }, errorText: { color: palette.danger, fontSize: 12, lineHeight: 18 }, retry: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: palette.green, borderRadius: 10, backgroundColor: palette.white }, retryText: { color: palette.green, fontWeight: '800' }, list: { paddingHorizontal: 16, paddingBottom: 10, gap: 9 }, session: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: 13, backgroundColor: palette.white }, sessionSelected: { borderColor: palette.green, backgroundColor: '#F5FAF6' }, sessionDisabled: { opacity: 0.56 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#B8C0BA', alignItems: 'center', justifyContent: 'center', marginTop: 1 }, radioSelected: { borderColor: palette.green }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.green }, sessionCopy: { flex: 1, minWidth: 0 }, sessionId: { color: palette.ink, fontSize: 13, fontWeight: '800' }, meta: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, count: { color: palette.green, fontSize: 10, fontWeight: '700', marginTop: 4 }, blocked: { color: palette.warning, fontSize: 10, fontWeight: '800', marginTop: 4 }, empty: { marginHorizontal: 16, gap: 10 }, footer: { flexDirection: 'row', gap: 9, padding: 16, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.cream }, cancel: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.green, borderRadius: 11 }, cancelText: { color: palette.green, fontWeight: '800' }, confirm: { flex: 1.5, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: palette.green }, confirmText: { color: palette.white, fontWeight: '800' }, disabled: { opacity: 0.5 },
});
