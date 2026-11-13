import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, EmptyState, palette, StatusPill } from './ScopeUI';
import { Delivery } from './systemData';

type Props = { deliveries: Delivery[]; onReceive?: (id: string) => void };

export default function WarehouseDeliveryList({ deliveries, onReceive }: Props) {
  const [detail, setDetail] = useState<Delivery | null>(null);
  if (!deliveries.length) return <EmptyState icon="cube-outline" title="No delivery records" message="Deliveries matching this view will appear here." />;

  return <>
    <View style={styles.list}>{deliveries.map((item) => <Pressable key={item.id} onPress={() => setDetail(item)} accessibilityRole="button" accessibilityLabel={`View delivery ${item.displayCode}`}>
      <Card style={styles.card}>
        <View style={styles.top}><Text numberOfLines={1} ellipsizeMode="middle" style={styles.code}>{item.displayCode}</Text><StatusPill value={item.status} warehouse /></View>
        <View style={styles.infoGrid}><Info label="Associated batch" value={item.batchDisplayCode} /><Info label="Recorded weight" value={`${item.weightKg} kg`} /></View>
        <Info label="Delivery date" value={formatWarehouseDate(item.deliveryDate)} />
        <View style={styles.actions}><Text style={styles.detailsLink}>View details</Text>{onReceive && item.status === 'In Transit' ? <TouchableOpacity style={styles.receiveButton} onPress={(event) => { event.stopPropagation(); onReceive(item.id); }}><Text style={styles.receiveText}>Mark as received</Text></TouchableOpacity> : <Ionicons name="chevron-forward" size={19} color={palette.muted} />}</View>
      </Card>
    </Pressable>)}</View>

    <Modal visible={Boolean(detail)} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
      <Pressable style={styles.overlay} onPress={() => setDetail(null)}><Pressable style={styles.sheet} onPress={() => undefined}>
        <View style={styles.handle} /><View style={styles.modalHeader}><View style={styles.modalCopy}><Text style={styles.modalTitle}>Delivery details</Text><Text numberOfLines={1} ellipsizeMode="middle" style={styles.modalCode}>{detail?.displayCode}</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setDetail(null)} accessibilityLabel="Close delivery details"><Ionicons name="close" size={22} color={palette.ink} /></TouchableOpacity></View>
        {detail ? <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailCard} showsVerticalScrollIndicator={false}>
          <View style={styles.detailStatus}><Text style={styles.detailLabel}>Status</Text><StatusPill value={detail.status} warehouse /></View>
          <DetailRow label="Associated batch" value={detail.batchDisplayCode} />
          {detail.batchId !== detail.batchDisplayCode ? <DetailRow label="Original batch reference" value={detail.batchId} /> : null}
          <DetailRow label="Recorded weight" value={`${detail.weightKg} kg`} />
          <DetailRow label="Delivery date" value={formatWarehouseDate(detail.deliveryDate)} />
          {isActual(detail.destination, 'Assigned warehouse') ? <DetailRow label="Warehouse destination" value={detail.destination} /> : null}
          {isActual(detail.sourceFarm, 'Assigned farm') ? <DetailRow label="Source farm" value={detail.sourceFarm} /> : null}
          {detail.dryingStatus ? <DetailRow label="Drying information" value={detail.dryingStatus} /> : null}
          {onReceive && detail.status === 'In Transit' ? <TouchableOpacity style={styles.modalReceive} onPress={() => { onReceive(detail.id); setDetail(null); }}><Text style={styles.modalReceiveText}>Mark as received</Text></TouchableOpacity> : null}
        </ScrollView> : null}
      </Pressable></Pressable>
    </Modal>
  </>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.label}>{label}</Text><Text numberOfLines={2} ellipsizeMode="middle" style={styles.value}>{value}</Text></View>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text selectable style={styles.detailValue}>{value}</Text></View>;
}

function isActual(value: string, fallback: string) { return Boolean(value.trim()) && value !== fallback; }

export function formatWarehouseDate(value: unknown) {
  let date: Date;
  if (value instanceof Date) date = value;
  else if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') date = value.toDate();
  else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) { const [year, month, day] = value.split('-').map(Number); date = new Date(Date.UTC(year, month - 1, day, 4)); }
  else date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
}

const styles = StyleSheet.create({
  list: { gap: 12 }, card: { padding: 15 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, code: { flex: 1, minWidth: 0, color: palette.ink, fontSize: 19, lineHeight: 24, fontWeight: '800' },
  infoGrid: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: palette.line }, info: { flex: 1, minWidth: 0, marginBottom: 10 }, label: { color: palette.muted, fontSize: 14, lineHeight: 19 }, value: { color: palette.ink, fontSize: 16, lineHeight: 22, fontWeight: '600', marginTop: 3 },
  actions: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 10 }, detailsLink: { color: palette.green, fontSize: 14, fontWeight: '700' }, receiveButton: { minHeight: 42, justifyContent: 'center', backgroundColor: palette.green, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 }, receiveText: { color: palette.white, fontSize: 14, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, sheet: { backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 30 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 15 }, modalCopy: { flex: 1, minWidth: 0 }, modalTitle: { color: palette.ink, fontSize: 22, lineHeight: 28, fontWeight: '700' }, modalCode: { color: palette.green, fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 2 }, closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  detailScroll: { maxHeight: '70%', marginHorizontal: 16 }, detailCard: { backgroundColor: palette.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: palette.line }, detailStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 10, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: palette.line }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, paddingVertical: 8 }, detailLabel: { flex: 1, color: palette.muted, fontSize: 14, lineHeight: 20 }, detailValue: { flex: 1.35, color: palette.ink, fontSize: 15, lineHeight: 21, fontWeight: '600', textAlign: 'right' }, modalReceive: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: palette.green, marginTop: 12 }, modalReceiveText: { color: palette.white, fontSize: 15, fontWeight: '700' },
});
