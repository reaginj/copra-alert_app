import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

const summaryRows = [
  { label: 'This Month', value: '₱14,520.00' },
  { label: 'Total Deliveries', value: '5' },
  { label: 'Total Quantity', value: '240 kg' },
];

export default function TransactionSummaryCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="clipboard-outline" size={17} color="#1E8A3A" />
        </View>
        <Text style={styles.cardTitle}>Monthly Summary</Text>
      </View>

      <View style={styles.summaryList}>
        {summaryRows.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.summaryRow,
              index < summaryRows.length - 1 && styles.summaryRowDivider,
            ]}
          >
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  summaryList: {
    borderRadius: 10,
    backgroundColor: '#FBFCFA',
    borderWidth: 1,
    borderColor: '#F0EEE9',
  },
  summaryRow: {
    minHeight: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 8,
  },
  summaryRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3DB',
  },
  summaryLabel: {
    flex: 1,
    fontSize: 11,
    color: '#4E463E',
    fontWeight: '700',
  },
  summaryValue: {
    flexShrink: 0,
    fontSize: 12,
    color: '#1E8A3A',
    fontWeight: '900',
    textAlign: 'right',
  },
});
