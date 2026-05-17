import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type WarehouseStats = {
  inTransit: number;
  underReview: number;
  accepted: number;
  inventory: string;
};

type WarehouseStatsGridProps = {
  stats: WarehouseStats;
};

export default function WarehouseStatsGrid({ stats }: WarehouseStatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <StatCard icon="trail-sign-outline" label="In Transit" value={`${stats.inTransit}`} color="#B9770E" />
      <StatCard icon="shield-checkmark-outline" label="Under Review" value={`${stats.underReview}`} color="#B9770E" />
      <StatCard icon="checkmark-circle-outline" label="Accepted" value={`${stats.accepted}`} color="#2E7D32" />
      <StatCard icon="archive-outline" label="Inventory" value={stats.inventory} color="#4A3728" />
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4A3728',
  },
  statLabel: {
    fontSize: 11,
    color: '#74665A',
    marginTop: 3,
    fontWeight: '700',
  },
});
