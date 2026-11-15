import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { Card, commonStyles, DataStateNotice, palette, SectionHeading } from '@/components/copra/ScopeUI';
import { useSystemData } from '@/components/copra/systemData';
import WarehouseDeliveryList from '@/components/copra/WarehouseDeliveryList';

export default function WarehouseDashboard() {
  const { deliveries, loading, error } = useSystemData();
  const incoming = deliveries.filter((item) => item.status === 'Scheduled' || item.status === 'In Transit');
  const received = deliveries.filter((item) => item.status === 'Received');
  const counts = ['Scheduled', 'In Transit', 'Received'].map((status) => ({ status, count: deliveries.filter((item) => item.status === status).length }));
  const recentDeliveries = useMemo(() => [...deliveries]
    .sort((left, right) => deliveryCreatedTime(right) - deliveryCreatedTime(left))
    .slice(0, 3), [deliveries]);

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Copra-Alert" subtitle="Warehouse Personnel Dashboard" profileRoute="/(warehouse)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <SectionHeading title="Delivery Overview" />
      <View style={styles.overviewList}><OverviewCard icon="download-outline" label="Incoming Deliveries" description="Scheduled & In Transit" value={incoming.length} /><OverviewCard icon="checkmark-circle-outline" label="Received Deliveries" description="Successfully received" value={received.length} /></View>
      <Card style={styles.summaryCard}><Text style={styles.summaryTitle}>Status Summary</Text><View style={styles.summaryRow}>{counts.map(({ status, count }) => <View key={status} style={styles.summaryItem}><Text style={styles.summaryCount}>{count}</Text><Text style={styles.summaryLabel}>{status}</Text></View>)}</View></Card>
      <SectionHeading title="Recent Delivery Records" />
      {!loading && !error ? <WarehouseDeliveryList deliveries={recentDeliveries} /> : null}
      <TouchableOpacity style={styles.viewAll} activeOpacity={0.78} onPress={() => router.push('/(warehouse)/records' as never)} accessibilityRole="button"><Text style={styles.viewAllText}>View All Records</Text><Ionicons name="arrow-forward" size={17} color={palette.green} /></TouchableOpacity>
    </ScrollView>
  </View>;
}

function OverviewCard({ icon, label, description, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; description: string; value: number }) {
  return <Card style={styles.overviewCard}><View style={styles.overviewIcon}><Ionicons name={icon} size={20} color={palette.green} /></View><View style={styles.overviewCopy}><Text numberOfLines={1} style={styles.overviewLabel}>{label}</Text><Text numberOfLines={1} style={styles.overviewDescription}>{description}</Text></View><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.overviewValue}>{value}</Text></Card>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, overviewList: { gap: 10 }, overviewCard: { minHeight: 78, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, overviewIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center' }, overviewCopy: { flex: 1, minWidth: 0 }, overviewLabel: { color: palette.ink, fontSize: 16, lineHeight: 21, fontWeight: '700' }, overviewDescription: { color: palette.muted, fontSize: 13, lineHeight: 18, marginTop: 2 }, overviewValue: { minWidth: 42, maxWidth: 82, color: palette.greenDark, fontSize: 30, lineHeight: 34, fontWeight: '800', textAlign: 'right' },
  summaryCard: { padding: 14 }, summaryTitle: { color: palette.ink, fontSize: 16, lineHeight: 22, fontWeight: '700', marginBottom: 10 }, summaryRow: { flexDirection: 'row' }, summaryItem: { flex: 1, alignItems: 'center', paddingHorizontal: 3 }, summaryCount: { color: palette.greenDark, fontSize: 17, lineHeight: 22, fontWeight: '700' }, summaryLabel: { color: palette.muted, fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 2 },
  viewAll: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: palette.green, borderRadius: 12, backgroundColor: palette.white, paddingHorizontal: 14 }, viewAllText: { color: palette.green, fontSize: 14, fontWeight: '700' },
});

function deliveryCreatedTime(delivery: { createdAt?: string; deliveryDate: string }) {
  const primary = delivery.createdAt ? new Date(delivery.createdAt).getTime() : Number.NaN;
  if (Number.isFinite(primary)) return primary;
  const fallback = new Date(delivery.deliveryDate).getTime();
  return Number.isFinite(fallback) ? fallback : 0;
}
