import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, DataStateNotice, EmptyState, palette } from '@/components/copra/ScopeUI';
import { getDeliveryWeightSummary, useSystemData } from '@/components/copra/systemData';

export default function RecordedSacks() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId?: string }>();
  const { deliveries, loading, error } = useSystemData();
  const [search, setSearch] = useState('');
  const delivery = deliveries.find((item) => item.id === deliveryId);
  const summary = delivery ? getDeliveryWeightSummary(delivery) : null;
  const sacks = [...(delivery?.sackWeights ?? [])]
    .sort((left, right) => sackNumber(left.sackId) - sackNumber(right.sackId))
    .filter((item) => item.sackId.toLowerCase().includes(search.trim().toLowerCase()));

  const header = <>
    <View style={styles.header}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Back"><Ionicons name="arrow-back" size={22} color={palette.white} /></TouchableOpacity>
      <View style={styles.headerCopy}><Text style={styles.title}>Recorded Sacks</Text><Text numberOfLines={1} style={styles.subtitle}>{delivery ? `${delivery.displayCode} · ${delivery.destination}` : 'Delivery record'}</Text></View>
    </View>
    <View style={styles.bodyHeader}>
      <DataStateNotice loading={loading} error={error} />
      {delivery ? <View style={styles.summary}><Card style={styles.summaryCard}><Text style={styles.summaryLabel}>Total Sacks</Text><Text style={styles.summaryValue}>{summary?.totalSacks ?? 0}</Text></Card><Card style={styles.summaryCard}><Text style={styles.summaryLabel}>Total Weight</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>{summary ? `${summary.totalWeightKg.toFixed(1)} kg` : 'Unavailable'}</Text></Card></View> : null}
      <View style={styles.searchWrap}><Ionicons name="search-outline" size={19} color={palette.muted} /><TextInput value={search} onChangeText={setSearch} style={styles.search} placeholder="Search sack number" placeholderTextColor="#7B847D" returnKeyType="search" /></View>
    </View>
  </>;

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <FlatList
      data={sacks}
      keyExtractor={(item) => item.sackId}
      renderItem={({ item }) => <View style={styles.row}><View style={styles.sackIcon}><Ionicons name="bag-handle-outline" size={18} color={palette.green} /></View><Text style={styles.sackId}>{item.sackId}</Text><Text style={styles.weight}>{item.weightKg.toFixed(1)} kg</Text></View>}
      ListHeaderComponent={header}
      ListEmptyComponent={!loading && !error ? <View style={styles.emptyWrap}><EmptyState icon="bag-handle-outline" title={delivery ? 'No matching sacks' : 'Delivery not available'} message={delivery ? 'No recorded sack matches this search.' : 'This delivery is not available for the signed-in account.'} /></View> : undefined}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  </SafeAreaView>;
}

function sackNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream }, content: { paddingBottom: 24 }, header: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.greenDark, paddingHorizontal: 16, paddingVertical: 14 }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF1F' }, headerCopy: { flex: 1, minWidth: 0 }, title: { color: palette.white, fontSize: 22, fontWeight: '800' }, subtitle: { color: '#DDEADD', fontSize: 12, marginTop: 3 }, bodyHeader: { gap: 12, padding: 16, paddingBottom: 10 }, summary: { flexDirection: 'row', gap: 10 }, summaryCard: { flex: 1, padding: 13 }, summaryLabel: { color: palette.muted, fontSize: 11, fontWeight: '700' }, summaryValue: { color: palette.greenDark, fontSize: 21, fontWeight: '800', marginTop: 4 }, searchWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#CDD2CB', backgroundColor: palette.white, borderRadius: 12, paddingHorizontal: 13 }, search: { flex: 1, paddingVertical: 11, color: palette.ink, fontSize: 14 }, row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 13, backgroundColor: palette.white }, sackIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen }, sackId: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '700' }, weight: { color: palette.greenDark, fontSize: 15, fontWeight: '800' }, emptyWrap: { paddingHorizontal: 16 },
});
