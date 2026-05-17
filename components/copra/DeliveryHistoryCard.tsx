import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DeliveryStatus = 'In Transit' | 'Under Review' | 'Accepted' | 'Rejected';

const statusColors: Record<DeliveryStatus, { background: string; text: string }> = {
  'In Transit': { background: '#F5E3C8', text: '#9A5A14' },
  'Under Review': { background: '#F8ECC8', text: '#8A6412' },
  Accepted: { background: '#DDEFD9', text: '#1E8A3A' },
  Rejected: { background: '#F1DEDB', text: '#A43A2F' },
};

const deliveries = [
  {
    date: 'May 25, 2024',
    time: '10:30 AM',
    warehouseName: 'Green Valley Warehouse',
    quantity: '240 kg',
    pricePerKg: '₱60.50/kg',
    status: 'In Transit' as DeliveryStatus,
  },
  {
    date: 'May 20, 2024',
    time: '02:15 PM',
    warehouseName: 'San Isidro Warehouse',
    quantity: '245 kg',
    pricePerKg: '₱59.00/kg',
    status: 'Under Review' as DeliveryStatus,
  },
  {
    date: 'May 15, 2024',
    time: '09:45 AM',
    warehouseName: 'Coconut Processing Warehouse',
    quantity: '230 kg',
    pricePerKg: '₱58.00/kg',
    status: 'Accepted' as DeliveryStatus,
  },
];

export default function DeliveryHistoryCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Delivery History</Text>
        <TouchableOpacity activeOpacity={0.75}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {deliveries.map((delivery) => {
        const statusColor = statusColors[delivery.status];

        return (
          <View key={`${delivery.date}-${delivery.time}`} style={styles.historyRow}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="truck" size={17} color="#1E8A3A" />
            </View>

            <View style={styles.historyInfo}>
              <View style={styles.historyTop}>
                <Text style={styles.warehouseName}>{delivery.warehouseName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.background }]}>
                  <Text style={[styles.statusText, { color: statusColor.text }]}>
                    {delivery.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.dateText}>{delivery.date}</Text>
                <Text style={styles.timeText}>{delivery.time}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.metaText}>{delivery.quantity}</Text>
                <Text style={styles.priceText}>{delivery.pricePerKg}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#1E8A3A',
    fontSize: 12,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EEE9',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warehouseName: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
    fontWeight: '800',
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#4A3728',
    fontWeight: '800',
  },
  priceText: {
    fontSize: 12,
    color: '#1E8A3A',
    fontWeight: '800',
  },
});
