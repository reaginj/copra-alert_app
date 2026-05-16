import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WeightMeasurementCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Weight Measurement</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="scale-outline" size={60} color="#1E8A3A" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>Kasalukuyang Timbang</Text>
          <Text style={styles.weight}>240 kg</Text>

          <View style={styles.updateRow}>
            <Ionicons name="time-outline" size={16} color="#333" />
            <Text style={styles.sub}>Huling Update: 9:30 AM</Text>
          </View>
        </View>
      </View>
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
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#333333',
  },
  weight: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1E8A3A',
    marginTop: 4,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  sub: {
    fontSize: 12,
    color: '#555555',
  },
});
