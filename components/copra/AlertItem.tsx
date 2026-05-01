import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertItemProps = {
  type: 'Delikado' | 'Babala' | 'Normal';
  title: string;
  message: string;
  temp?: string;
  time: string;
};

export default function AlertItem({
  type,
  title,
  message,
  temp,
  time,
}: AlertItemProps) {

  const getColor = () => {
    if (type === 'Delikado') return '#D64545';
    if (type === 'Babala') return '#E6A23C';
    return '#2F5D3A';
  };

  const getBadgeStyle = () => {
    if (type === 'Delikado') return styles.badgeCritical;
    if (type === 'Babala') return styles.badgeWarning;
    return styles.badgeNormal;
  };

  return (
    <View style={styles.card}>

      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.row}>
          <Ionicons name="alert-circle-outline" size={20} color={getColor()} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* BADGE */}
        <View style={[styles.badge, getBadgeStyle()]}>
          <Text style={styles.badgeText}>{type}</Text>
        </View>
      </View>

      {/* MESSAGE */}
      <Text style={styles.message}>{message}</Text>

      {/* META */}
      <Text style={styles.meta}>
        {temp ? `${temp} • ` : ''}{time}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  title: {
    fontWeight: '600',
    fontSize: 15,
    color: '#3D2F25',
  },

  message: {
    marginTop: 4,
    fontSize: 13,
    color: '#6E7C74',
  },

  meta: {
    marginTop: 6,
    fontSize: 12,
    color: '#9A8F85',
  },

  // BADGE BASE
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // BADGE COLORS
  badgeCritical: {
    backgroundColor: '#FFE5E5',
  },

  badgeWarning: {
    backgroundColor: '#FFF4E5',
  },

  badgeNormal: {
    backgroundColor: '#EAF5EE',
  },
});