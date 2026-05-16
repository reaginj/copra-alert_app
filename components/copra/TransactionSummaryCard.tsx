import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const summaryItems = [
  { label: 'This Month', value: '₱18,750', icon: 'cash-outline' as const },
  { label: 'Total Deliveries', value: '7', icon: 'cube-outline' as const },
  { label: 'Total Quantity', value: '375 kg', icon: 'scale-outline' as const },
  { label: 'Pending', value: '2', icon: 'time-outline' as const },
];

export default function TransactionSummaryCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Transaction Summary</Text>

      <View style={styles.grid}>
        {summaryItems.map((item) => (
          <View key={item.label} style={styles.summaryBox}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={17} color="#1E8A3A" />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryBox: {
    width: '48%',
    backgroundColor: '#F6F8F4',
    borderRadius: 10,
    padding: 9,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#4A3728',
    fontWeight: '800',
  },
  label: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
    fontWeight: '700',
  },
});
