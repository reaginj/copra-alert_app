import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type DeliveryStatus = 'Pending Receipt' | 'Under Review' | 'Accepted' | 'Rejected';

const statusColors: Record<DeliveryStatus, string> = {
  'Pending Receipt': '#B9770E',
  'Under Review': '#8A5A1E',
  Accepted: '#1E8A3A',
  Rejected: '#A43A2F',
};

const deliveries = [
  {
    date: 'May 16, 2026',
    time: '9:30 AM',
    warehouseName: 'Davao Copra Warehouse',
    quantity: '50 kg',
    pricePerKg: '₱50/kg',
    status: 'Pending Receipt' as DeliveryStatus,
  },
  {
    date: 'May 14, 2026',
    time: '2:15 PM',
    warehouseName: 'Quezon Warehouse Hub',
    quantity: '74.5 kg',
    pricePerKg: '₱52/kg',
    status: 'Under Review' as DeliveryStatus,
  },
  {
    date: 'May 12, 2026',
    time: '10:45 AM',
    warehouseName: 'Davao Copra Warehouse',
    quantity: '45 kg',
    pricePerKg: '₱51/kg',
    status: 'Accepted' as DeliveryStatus,
  },
  {
    date: 'May 10, 2026',
    time: '4:20 PM',
    warehouseName: 'Sariaya Warehouse',
    quantity: '38.5 kg',
    pricePerKg: '₱49/kg',
    status: 'Rejected' as DeliveryStatus,
  },
];

export default function DeliveryHistoryCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Delivery History</Text>

      {deliveries.map((delivery) => {
        const statusColor = statusColors[delivery.status];

        return (
          <View key={`${delivery.date}-${delivery.time}`} style={styles.historyRow}>
            <View style={styles.iconBox}>
              <Ionicons name="receipt-outline" size={21} color="#1E8A3A" />
            </View>

            <View style={styles.historyInfo}>
              <View style={styles.historyTop}>
                <Text style={styles.warehouseName}>{delivery.warehouseName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {delivery.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{delivery.date} • {delivery.time}</Text>
              <Text style={styles.metaText}>
                {delivery.quantity} • {delivery.pricePerKg}
              </Text>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
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
  dateText: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#4A3728',
    marginTop: 3,
    fontWeight: '700',
  },
});
