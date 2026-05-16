import { StyleSheet, Text, View } from 'react-native';

type AlertFilterBarProps<T extends string> = {
  filters: T[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
};

export default function AlertFilterBar<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
}: AlertFilterBarProps<T>) {
  return (
    <View style={styles.filterRow}>
      {filters.map((item) => (
        <Text
          key={item}
          onPress={() => onFilterChange(item)}
          style={[styles.filter, activeFilter === item && styles.filterActive]}
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filter: {
    backgroundColor: '#EFE7DC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#4A3728',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  filterActive: {
    backgroundColor: '#4A3728',
    color: '#FFFFFF',
  },
});
