import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Copra-Alert" subtitle="Warehouse Personnel Dashboard" profileRoute="/(warehouse)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <SectionHeading title="Delivery Overview" />
      <View style={styles.grid}><OverviewCard icon="download-outline" label="Incoming" value={incoming.length} /><OverviewCard icon="checkmark-circle-outline" label="Received" value={received.length} /></View>
      <Card style={styles.summaryCard}><Text style={styles.summaryTitle}>Status Summary</Text><View style={styles.summaryRow}>{counts.map(({ status, count }) => <View key={status} style={styles.summaryItem}><Text style={styles.summaryCount}>{count}</Text><Text style={styles.summaryLabel}>{status}</Text></View>)}</View></Card>
      <SectionHeading title="Recent Delivery Records" />
      <WarehouseDeliveryList deliveries={deliveries.slice(0, 2)} />
    </ScrollView>
  </View>;
}

function OverviewCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) {
  return <Card style={styles.overviewCard}><View style={styles.overviewIcon}><Ionicons name={icon} size={21} color={palette.green} /></View><Text style={styles.overviewValue}>{value}</Text><Text style={styles.overviewLabel}>{label}</Text></Card>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, grid: { flexDirection: 'row', gap: 10 }, overviewCard: { flex: 1, minWidth: 0, padding: 15 }, overviewIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, overviewValue: { color: palette.greenDark, fontSize: 28, lineHeight: 32, fontWeight: '700' }, overviewLabel: { color: palette.ink, fontSize: 16, lineHeight: 22, fontWeight: '600', marginTop: 3 },
  summaryCard: { padding: 14 }, summaryTitle: { color: palette.ink, fontSize: 16, lineHeight: 22, fontWeight: '700', marginBottom: 10 }, summaryRow: { flexDirection: 'row' }, summaryItem: { flex: 1, alignItems: 'center', paddingHorizontal: 3 }, summaryCount: { color: palette.greenDark, fontSize: 17, lineHeight: 22, fontWeight: '700' }, summaryLabel: { color: palette.muted, fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 2 },
});
