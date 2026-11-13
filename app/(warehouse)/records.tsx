import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { commonStyles, DataStateNotice, palette } from '@/components/copra/ScopeUI';
import { DeliveryStatus, useSystemData } from '@/components/copra/systemData';
import WarehouseDeliveryList from '@/components/copra/WarehouseDeliveryList';

const filters: ('All' | DeliveryStatus)[] = ['All', 'Scheduled', 'In Transit', 'Received', 'Cancelled'];

export default function Records() {
  const { deliveries, loading, error } = useSystemData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const list = useMemo(() => deliveries.filter((item) => (filter === 'All' || item.status === filter) && `${item.displayCode} ${item.batchDisplayCode ?? ''} ${item.id} ${item.batchId ?? ''} ${item.sourceFarm}`.toLowerCase().includes(search.trim().toLowerCase())), [deliveries, filter, search]);

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Delivery Records" subtitle="Search and filter recorded deliveries" profileRoute="/(warehouse)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search delivery, batch, or farm" placeholderTextColor="#7B847D" autoCapitalize="none" returnKeyType="search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.active]}><Text style={[styles.filterText, filter === item && styles.activeText]}>{item}</Text></TouchableOpacity>)}</ScrollView>
      <WarehouseDeliveryList deliveries={list} />
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, search: { minHeight: 52, borderWidth: 1, borderColor: '#CDD2CB', backgroundColor: palette.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: palette.ink, fontSize: 15 }, filters: { gap: 8, paddingRight: 16 }, filter: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 21, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line }, active: { backgroundColor: palette.green, borderColor: palette.green }, filterText: { fontWeight: '700', color: palette.muted, fontSize: 14 }, activeText: { color: palette.white },
});
