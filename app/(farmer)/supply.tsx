import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import DatePickerField from '@/components/copra/DatePickerField';
import { Card, commonStyles, DataStateNotice, EmptyState, FilterPills, formatAppDate, PageActionButton, palette, SectionHeading, StatusPill } from '@/components/copra/ScopeUI';
import { Delivery, DeliveryStatus, useSystemData } from '@/components/copra/systemData';

const filters = ['All', 'Scheduled', 'In Transit', 'Received'] as const;
type DeliveryFilter = typeof filters[number];

export default function Deliveries() {
  const insets = useSafeAreaInsets();
  const { deliveries, warehouses, createDelivery, updateDeliveryStatus, loading, error } = useSystemData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DeliveryFilter>('All');
  const [warehouseUserId, setWarehouseUserId] = useState('');
  const [date, setDate] = useState(() => atLocalNoon(new Date()));
  const visibleDeliveries = useMemo(() => deliveries.filter((item) => filter === 'All' || item.status === filter), [deliveries, filter]);
  const detail = deliveries.find((item) => item.id === detailId) ?? null;

  const close = () => { Keyboard.dismiss(); setOpen(false); };
  const openCreate = () => {
    setWarehouseUserId(warehouses[0]?.uid ?? '');
    setDate(atLocalNoon(new Date()));
    setOpen(true);
  };
  const save = async () => {
    if (submittingRef.current) return;
    if (!warehouseUserId) return Alert.alert('Check details', 'Select a destination warehouse and delivery date.');
    try {
      submittingRef.current = true;
      setSaving(true);
      const deliveryId = await createDelivery({ warehouseUserId, deliveryDate: date });
      setDetailId(deliveryId);
      Keyboard.dismiss(); setOpen(false); setDate(atLocalNoon(new Date()));
      Alert.alert('Delivery created', 'The delivery record was saved.');
    } catch (cause) {
      Alert.alert('Unable to create delivery', cause instanceof Error ? cause.message : 'Please try again.');
    } finally { submittingRef.current = false; setSaving(false); }
  };
  const updateStatus = async (id: string, status: DeliveryStatus) => {
    try {
      await updateDeliveryStatus(id, status);
    } catch (cause) {
      Alert.alert('Unable to update delivery', cause instanceof Error ? cause.message : 'Please try again.');
    }
  };

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Deliveries" subtitle="Create and track delivery records" profileRoute="/(farmer)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <View style={styles.pageHead}><View style={styles.pageCopy}><SectionHeading title="Delivery Records" /></View><PageActionButton label="New Delivery" onPress={openCreate} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}><FilterPills values={filters} selected={filter} onSelect={setFilter} /></ScrollView>
      {visibleDeliveries.length ? visibleDeliveries.map((item) => <TouchableOpacity key={item.id} activeOpacity={0.76} onPress={() => setDetailId(item.id)}><Card style={styles.deliveryCard}>
        <View style={styles.top}><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.id}>{item.displayCode}</Text>{item.batchDisplayCode ? <Text style={styles.batch}>{item.batchDisplayCode}</Text> : null}</View><StatusPill value={item.status} /></View>
        <View style={styles.line} /><View style={styles.destinationRow}><Ionicons name="business-outline" size={16} color={palette.green} /><Text style={styles.destination}>{item.destination}</Text></View><View style={styles.deliveryMeta}><Text style={styles.deliveryMetaText}>{deliveryCardMeta(item)}</Text><Ionicons name="chevron-forward" size={17} color={palette.muted} /></View>
      </Card></TouchableOpacity>) : <EmptyState icon="cube-outline" title={`No ${filter.toLowerCase()} deliveries`} message="No delivery records match this filter." />}
    </ScrollView>

    <Modal visible={Boolean(detail)} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setDetailId(null)}>
      <Pressable style={[styles.detailOverlay, { paddingTop: Math.max(insets.top, 16) }]} onPress={() => setDetailId(null)}>
        <Pressable style={[styles.detailSheet, { maxHeight: '100%', flexShrink: 1, paddingBottom: Math.max(insets.bottom, 16) }]} onPress={() => undefined}>
          <View style={styles.handle} />
          <View style={styles.modalHead}><View style={{ flex: 1 }}><Text style={styles.modalTitle}>Delivery details</Text><Text style={styles.modalSubtitle}>{detail?.displayCode}</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setDetailId(null)}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
          {detail ? <ScrollView style={[styles.detailScroll, { maxHeight: undefined, flexShrink: 1 }]} contentContainerStyle={[styles.detailBody, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.detailStatus}><Text style={styles.detailStatusLabel}>Delivery status</Text><StatusPill value={detail.status} /></View>
            {[...(detail.batchDisplayCode ? [['Associated batch (legacy)', detail.batchDisplayCode]] : []), ['Warehouse destination', detail.destination], ...(detail.legacyWeightKg != null ? [['Previously recorded weight', `${detail.legacyWeightKg} kg`]] : []), ['Delivery date', formatAppDate(detail.deliveryDate, false)]].map(([label, value]) => <View key={label} style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>{label}</Text><Text style={commonStyles.detailValue}>{value}</Text></View>)}
            <View style={styles.weighSection}><View style={styles.weighTitleRow}><View style={styles.weighIcon}><Ionicons name="scale-outline" size={18} color={palette.green} /></View><Text style={styles.weighTitle}>Recorded Sacks</Text></View>{detail.totalSacks > 0 && detail.totalWeightKg != null ? <><View style={styles.weighTotals}><View><Text style={styles.weighLabel}>Total sacks</Text><Text style={styles.weighValue}>{detail.totalSacks}</Text></View><View style={styles.weighDivider} /><View><Text style={styles.weighLabel}>Total weight</Text><Text style={styles.weighValue}>{detail.totalWeightKg.toFixed(1)} kg</Text></View></View>{detail.sackWeights?.slice(0, 3).map((sack) => <View key={sack.sackId} style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>{sack.sackId}</Text><Text style={commonStyles.detailValue}>{sack.weightKg.toFixed(1)} kg</Text></View>)}{detail.sackWeights && detail.sackWeights.length > 3 ? <TouchableOpacity style={styles.viewSacks} onPress={() => { const deliveryId = detail.id; setDetailId(null); router.push({ pathname: '/recorded-sacks', params: { deliveryId } }); }}><Text style={styles.viewSacksText}>View All Sacks</Text><Ionicons name="arrow-forward" size={16} color={palette.green} /></TouchableOpacity> : null}</> : <Text style={styles.noWeights}>No recorded sack weights</Text>}</View>
            {detail.status === 'Scheduled' ? <TouchableOpacity style={styles.secondary} onPress={() => updateStatus(detail.id, 'In Transit')}><Ionicons name="navigate-outline" size={17} color={palette.green} /><Text style={styles.secondaryText}>Mark as in transit</Text></TouchableOpacity> : null}
          </ScrollView> : null}
        </Pressable>
      </Pressable>
    </Modal>

    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}><View style={styles.dismissArea} /></TouchableWithoutFeedback>
        <View style={styles.sheet}><View style={styles.handle} /><View style={styles.modalHead}><View><Text style={styles.modalTitle}>Create delivery</Text><Text style={styles.modalSubtitle}>Enter the delivery information</Text></View><TouchableOpacity style={styles.closeButton} onPress={close}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
            <View><Text style={commonStyles.label}>Destination warehouse</Text>{warehouses.length ? <View style={styles.chips}>{warehouses.map((warehouse) => <TouchableOpacity key={warehouse.uid} onPress={() => setWarehouseUserId(warehouse.uid)} style={[styles.chip, warehouseUserId === warehouse.uid && styles.chipActive]}><Ionicons name={warehouseUserId === warehouse.uid ? 'checkmark-circle' : 'business-outline'} size={16} color={warehouseUserId === warehouse.uid ? palette.white : palette.muted} /><Text style={[styles.chipText, warehouseUserId === warehouse.uid && styles.chipTextActive]}>{warehouse.warehouseName?.trim() || warehouse.displayName?.trim() || warehouse.email}</Text></TouchableOpacity>)}</View> : <Text style={styles.noWarehouse}>No Warehouse accounts are available.</Text>}</View>
            <View><Text style={commonStyles.label}>Delivery date</Text><DatePickerField value={date} onChange={(value) => setDate(atLocalNoon(value))} mode="date" /></View>
            <TouchableOpacity style={commonStyles.primary} onPress={save} activeOpacity={0.82} disabled={saving}><Text style={commonStyles.primaryText}>{saving ? 'Saving…' : 'Save delivery'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={close}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  viewSacks: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 10 },
  viewSacksText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  safe: { backgroundColor: palette.greenDark }, pageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, pageCopy: { flex: 1 }, pageTitle: { color: palette.ink, fontSize: 20, fontWeight: '700' }, pageSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, filterScroll: { paddingRight: 4 }, deliveryCard: { padding: 13 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, id: { fontWeight: '700', color: palette.ink, fontSize: 17 }, batch: { color: palette.green, fontWeight: '600', fontSize: 11, marginTop: 3 }, line: { height: 1, backgroundColor: palette.line, marginVertical: 10 }, destinationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, destination: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '600', lineHeight: 19, flexWrap: 'wrap' }, deliveryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, deliveryMetaText: { color: palette.muted, fontSize: 12, fontWeight: '500' }, secondary: { minHeight: 44, flexDirection: 'row', gap: 7, borderWidth: 1, borderColor: palette.green, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, secondaryText: { color: palette.green, fontWeight: '700' }, detailOverlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, detailSheet: { maxHeight: '92%', backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 28 }, detailScroll: { maxHeight: '78%', marginHorizontal: 16 }, detailBody: { backgroundColor: palette.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: palette.line }, detailStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: palette.line }, detailStatusLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' }, weighSection: { marginTop: 14, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: palette.line, backgroundColor: '#F7FAF7' }, weighTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, weighIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen }, weighTitle: { color: palette.ink, fontSize: 14, fontWeight: '700' }, noWeights: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 11 }, weighTotals: { flexDirection: 'row', alignItems: 'center', marginTop: 12 }, weighDivider: { width: 1, height: 34, backgroundColor: palette.line, marginHorizontal: 24 }, weighLabel: { color: palette.muted, fontSize: 10, fontWeight: '600' }, weighValue: { color: palette.greenDark, fontSize: 18, fontWeight: '700', marginTop: 2 }, overlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, dismissArea: { flex: 1 }, sheet: { maxHeight: '88%', backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, gap: 12 }, modalTitle: { fontSize: 20, fontWeight: '700', color: palette.ink }, modalSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' }, form: { paddingHorizontal: 20, paddingBottom: 28, gap: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white, maxWidth: '100%' }, chipActive: { backgroundColor: palette.green, borderColor: palette.green }, chipText: { fontSize: 11, fontWeight: '600', color: palette.muted, flexShrink: 1 }, chipTextActive: { color: palette.white }, noWarehouse: { color: palette.muted, fontSize: 12, paddingVertical: 8 }, cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: palette.muted, fontWeight: '700' },
});

function atLocalNoon(value: Date) {
  const result = new Date(value);
  result.setHours(12, 0, 0, 0);
  return result;
}

function deliveryCardMeta(delivery: Delivery) {
  const date = formatAppDate(delivery.deliveryDate, false);
  if (delivery.totalWeightKg != null) return `${delivery.totalWeightKg.toFixed(2)} kg · ${date}`;
  if (delivery.legacyWeightKg != null) return `${delivery.legacyWeightKg} kg legacy · ${date}`;
  return date;
}
