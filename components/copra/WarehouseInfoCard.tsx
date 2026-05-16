import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const warehouses = [
  {
    name: 'Davao Copra Warehouse',
    location: 'Davao City',
    contactNumber: '0912 345 6789',
    totalDeliveries: '12',
  },
  {
    name: 'Quezon Warehouse Hub',
    location: 'Quezon Province',
    contactNumber: '0998 765 4321',
    totalDeliveries: '8',
  },
];

export default function WarehouseInfoCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Warehouse Information</Text>
        <TouchableOpacity activeOpacity={0.75}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {warehouses.map((warehouse) => (
        <View key={warehouse.name} style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="business" size={22} color="#1E8A3A" />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.name}>{warehouse.name}</Text>
            <Text style={styles.sub}>{warehouse.location}</Text>
            <Text style={styles.sub}>{warehouse.contactNumber}</Text>
          </View>

          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryValue}>{warehouse.totalDeliveries}</Text>
            <Text style={styles.deliveryLabel}>Deliveries</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#1E8A3A',
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
  infoBox: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '800',
  },
  sub: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  deliveryBox: {
    alignItems: 'flex-end',
  },
  deliveryValue: {
    fontSize: 16,
    color: '#1E8A3A',
    fontWeight: '800',
  },
  deliveryLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '700',
  },
});
