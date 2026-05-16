import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const activityRows = [
  'BATCH-003 added to inventory',
  'BATCH-002 is under quality check',
  'BATCH-001 in transit to warehouse',
  'BATCH-004 rejected due to moisture and weight mismatch',
];

export default function WarehouseActivityCard() {
  return (
    <>
      <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

      <View style={styles.activityCard}>
        {activityRows.map((title) => (
          <ActivityRow key={title} title={title} />
        ))}
      </View>
    </>
  );
}

function ActivityRow({ title }: { title: string }) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
      </View>

      <Text style={styles.activityText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    color: '#4A3728',
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E8A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#4A3728',
    fontWeight: '800',
  },
});
