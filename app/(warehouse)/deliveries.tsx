import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { commonStyles, DataStateNotice, palette, SectionHeading } from '@/components/copra/ScopeUI';
import { useSystemData } from '@/components/copra/systemData';
import WarehouseDeliveryList from '@/components/copra/WarehouseDeliveryList';

export default function Incoming() {
  const { deliveries, updateDeliveryStatus, loading, error } = useSystemData();
  const incoming = deliveries.filter((item) => item.status === 'Scheduled' || item.status === 'In Transit');
  const receive = async (id: string) => { try { await updateDeliveryStatus(id, 'Received'); } catch (cause) { Alert.alert('Unable to update delivery', cause instanceof Error ? cause.message : 'Please try again.'); } };
  return <View style={commonStyles.screen}><SafeAreaView edges={['top']} style={styles.safe}><Header title="Incoming Deliveries" subtitle="View and confirm copra arrivals" profileRoute="/(warehouse)/profile" /></SafeAreaView><ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}><DataStateNotice loading={loading} error={error} /><SectionHeading title="Incoming Deliveries" />{!loading && !error ? <WarehouseDeliveryList deliveries={incoming} onReceive={receive} /> : null}</ScrollView></View>;
}

const styles = StyleSheet.create({ safe: { backgroundColor: palette.greenDark } });
