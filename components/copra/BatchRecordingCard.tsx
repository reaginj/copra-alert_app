import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BatchRecordingCard() {
  return (
    <View style={styles.batchCard}>
      <Text style={styles.cardTitle}>Batch Recording</Text>

      <View style={styles.batchRow}>
        <View style={styles.batchIconBox}>
          <Ionicons name="clipboard-outline" size={55} color="#A66A00" />
        </View>

        <View style={styles.batchInfo}>
          <Text style={styles.batchLabel}>Batch ID</Text>
          <Text style={styles.batchNum}>COP-001</Text>
          <Text style={styles.date}>Started: May 23, 2026 10:00 AM</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Status:</Text>

            <View style={styles.ongoingBadge}>
              <Text style={styles.ongoingText}>Ongoing</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#A66A00" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  batchCard: {
    backgroundColor: '#FFF6E8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3E0BE',

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
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  batchIconBox: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#FFE7B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchInfo: {
    flex: 1,
  },
  batchLabel: {
    fontSize: 13,
    color: '#333333',
  },
  batchNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7A4B00',
    marginTop: 3,
  },
  date: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#333333',
  },
  ongoingBadge: {
    backgroundColor: '#FFE3A8',
    width: 85,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  ongoingText: {
    color: '#9A6100',
    fontSize: 12,
    fontWeight: '700',
  },
});
