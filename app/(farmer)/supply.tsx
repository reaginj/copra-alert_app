import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import DatePickerField from '@/components/copra/DatePickerField';
import { Card, commonStyles, DataStateNotice, EmptyState, FilterPills, formatAppDate, PageActionButton, palette, SectionHeading, StatusPill } from '@/components/copra/ScopeUI';
import { Delivery, DeliveryStatus, useSystemData } from '@/components/copra/systemData';

const WEIGHT_ACCESSORY = 'delivery-weight-accessory';
const filters = ['All', 'Scheduled', 'In Transit', 'Received'] as const;
type DeliveryFilter = typeof filters[number];

export default function Deliveries() {
  const { deliveries, batches, warehouses, createDelivery, updateDeliveryStatus, loading, error } = useSystemData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Delivery | null>(null);
  const [filter, setFilter] = useState<DeliveryFilter>('All');
  const [batchId, setBatchId] = useState('');
  const [warehouseUserId, setWarehouseUserId] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => atLocalNoon(new Date()));
  const visibleDeliveries = useMemo(() => deliveries.filter((item) => filter === 'All' || item.status === filter), [deliveries, filter]);

  const close = () => { Keyboard.dismiss(); setOpen(false); };
  const openCreate = () => {
    const selected = batches.find((item) => item.lifecycle === 'active') ?? batches[0];
    setBatchId(selected?.id ?? '');
    setWeight(selected?.weightKg ? String(selected.weightKg) : '');
    setWarehouseUserId(warehouses[0]?.uid ?? '');
    setDate(atLocalNoon(new Date()));
    setOpen(true);
  };
  const selectBatch = (id: string) => {
    setBatchId(id);
    const selected = batches.find((item) => item.id === id);
    setWeight(selected?.weightKg ? String(selected.weightKg) : '');
  };
  const save = async () => {
    const kg = Number(weight);
    if (!batchId || !warehouseUserId || !Number.isFinite(kg) || kg <= 0) return Alert.alert('Check details', 'Select a batch and destination warehouse, then enter a valid weight and delivery date.');
    try {
      setSaving(true);
      await createDelivery({ batchId, warehouseUserId, weightKg: kg, deliveryDate: date });
      Keyboard.dismiss(); setOpen(false); setWeight(''); setDate(atLocalNoon(new Date()));
      Alert.alert('Delivery created', 'The delivery record was saved.');
    } catch (cause) {
      Alert.alert('Unable to create delivery', cause instanceof Error ? cause.message : 'Please try again.');
    } finally { setSaving(false); }
  };
  const updateStatus = async (id: string, status: DeliveryStatus) => {
    try {
      await updateDeliveryStatus(id, status);
      setDetail((current) => current?.id === id ? { ...current, status } : current);
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
      {visibleDeliveries.length ? visibleDeliveries.map((item) => <TouchableOpacity key={item.id} activeOpacity={0.76} onPress={() => setDetail(item)}><Card style={styles.deliveryCard}>
        <View style={styles.top}><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.id}>{item.displayCode}</Text><Text style={styles.batch}>{item.batchDisplayCode}</Text></View><StatusPill value={item.status} /></View>
        <View style={styles.line} /><View style={styles.destinationRow}><Ionicons name="business-outline" size={16} color={palette.green} /><Text style={styles.destination}>{item.destination}</Text></View><View style={styles.deliveryMeta}><Text style={styles.deliveryMetaText}>{item.weightKg} kg · {formatAppDate(item.deliveryDate, false)}</Text><Ionicons name="chevron-forward" size={17} color={palette.muted} /></View>
      </Card></TouchableOpacity>) : <EmptyState icon="cube-outline" title={`No ${filter.toLowerCase()} deliveries`} message="No delivery records match this filter." />}
    </ScrollView>

    <Modal visible={Boolean(detail)} transparent animationType="slide" onRequestClose={() => setDetail(null)}><Pressable style={styles.detailOverlay} onPress={() => setDetail(null)}><Pressable style={styles.detailSheet} onPress={() => undefined}><View style={styles.handle} /><View style={styles.modalHead}><View style={{ flex: 1 }}><Text style={styles.modalTitle}>Delivery details</Text><Text style={styles.modalSubtitle}>{detail?.displayCode}</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setDetail(null)}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>{detail ? <View style={styles.detailBody}><View style={styles.detailStatus}><Text style={styles.detailStatusLabel}>Delivery status</Text><StatusPill value={detail.status} /></View>{[['Associated batch', detail.batchDisplayCode], ['Warehouse destination', detail.destination], ['Copra weight', `${detail.weightKg} kg`], ['Delivery date', formatAppDate(detail.deliveryDate, false)]].map(([label, value]) => <View key={label} style={commonStyles.detailRow}><Text style={commonStyles.detailLabel}>{label}</Text><Text style={commonStyles.detailValue}>{value}</Text></View>)}{detail.status === 'Scheduled' ? <TouchableOpacity style={styles.secondary} onPress={() => updateStatus(detail.id, 'In Transit')}><Ionicons name="navigate-outline" size={17} color={palette.green} /><Text style={styles.secondaryText}>Mark as in transit</Text></TouchableOpacity> : null}</View> : null}</Pressable></Pressable></Modal>

    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}><View style={styles.dismissArea} /></TouchableWithoutFeedback>
        <View style={styles.sheet}><View style={styles.handle} /><View style={styles.modalHead}><View><Text style={styles.modalTitle}>Create delivery</Text><Text style={styles.modalSubtitle}>Enter the delivery information</Text></View><TouchableOpacity style={styles.closeButton} onPress={close}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
            <View><Text style={commonStyles.label}>Associated batch</Text><View style={styles.chips}>{batches.map((batch) => <TouchableOpacity key={batch.id} onPress={() => selectBatch(batch.id)} style={[styles.chip, batchId === batch.id && styles.chipActive]}><Ionicons name={batchId === batch.id ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={batchId === batch.id ? palette.white : palette.muted} /><Text style={[styles.chipText, batchId === batch.id && styles.chipTextActive]}>{batch.displayCode}</Text></TouchableOpacity>)}</View></View>
            <View><Text style={commonStyles.label}>Destination warehouse</Text>{warehouses.length ? <View style={styles.chips}>{warehouses.map((warehouse) => <TouchableOpacity key={warehouse.uid} onPress={() => setWarehouseUserId(warehouse.uid)} style={[styles.chip, warehouseUserId === warehouse.uid && styles.chipActive]}><Ionicons name={warehouseUserId === warehouse.uid ? 'checkmark-circle' : 'business-outline'} size={16} color={warehouseUserId === warehouse.uid ? palette.white : palette.muted} /><Text style={[styles.chipText, warehouseUserId === warehouse.uid && styles.chipTextActive]}>{warehouse.warehouseName?.trim() || warehouse.displayName?.trim() || warehouse.email}</Text></TouchableOpacity>)}</View> : <Text style={styles.noWarehouse}>No Warehouse accounts are available.</Text>}</View>
            <View><Text style={commonStyles.label}>Copra weight (kg)</Text><TextInput style={commonStyles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Enter delivery weight" placeholderTextColor="#949C95" inputAccessoryViewID={Platform.OS === 'ios' ? WEIGHT_ACCESSORY : undefined} /></View>
            <View><Text style={commonStyles.label}>Delivery date</Text><DatePickerField value={date} onChange={(value) => setDate(atLocalNoon(value))} mode="date" /></View>
            <TouchableOpacity style={commonStyles.primary} onPress={save} activeOpacity={0.82} disabled={saving}><Text style={commonStyles.primaryText}>{saving ? 'Saving…' : 'Save delivery'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={close}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' ? <InputAccessoryView nativeID={WEIGHT_ACCESSORY}><View style={styles.keyboardBar}><TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneButton}><Text style={styles.doneText}>Done</Text></TouchableOpacity></View></InputAccessoryView> : null}
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, pageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, pageCopy: { flex: 1 }, pageTitle: { color: palette.ink, fontSize: 20, fontWeight: '700' }, pageSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, filterScroll: { paddingRight: 4 }, deliveryCard: { padding: 13 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, id: { fontWeight: '700', color: palette.ink, fontSize: 17 }, batch: { color: palette.green, fontWeight: '600', fontSize: 11, marginTop: 3 }, line: { height: 1, backgroundColor: palette.line, marginVertical: 10 }, destinationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, destination: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '600', lineHeight: 19, flexWrap: 'wrap' }, deliveryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, deliveryMetaText: { color: palette.muted, fontSize: 12, fontWeight: '500' }, secondary: { minHeight: 44, flexDirection: 'row', gap: 7, borderWidth: 1, borderColor: palette.green, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, secondaryText: { color: palette.green, fontWeight: '700' }, detailOverlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, detailSheet: { backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 28 }, detailBody: { marginHorizontal: 16, backgroundColor: palette.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: palette.line }, detailStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: palette.line }, detailStatusLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' }, overlay: { flex: 1, backgroundColor: '#13251BA6', justifyContent: 'flex-end' }, dismissArea: { flex: 1 }, sheet: { maxHeight: '88%', backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CCC5', alignSelf: 'center', marginBottom: 12 }, modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, gap: 12 }, modalTitle: { fontSize: 20, fontWeight: '700', color: palette.ink }, modalSubtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' }, form: { paddingHorizontal: 20, paddingBottom: 28, gap: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white, maxWidth: '100%' }, chipActive: { backgroundColor: palette.green, borderColor: palette.green }, chipText: { fontSize: 11, fontWeight: '600', color: palette.muted, flexShrink: 1 }, chipTextActive: { color: palette.white }, noWarehouse: { color: palette.muted, fontSize: 12, paddingVertical: 8 }, cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: palette.muted, fontWeight: '700' }, keyboardBar: { minHeight: 45, backgroundColor: '#F2F2F2', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C7C7C7', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 16 }, doneButton: { paddingHorizontal: 8, paddingVertical: 9 }, doneText: { color: palette.green, fontSize: 16, fontWeight: '700' },
});

function atLocalNoon(value: Date) {
  const result = new Date(value);
  result.setHours(12, 0, 0, 0);
  return result;
}
