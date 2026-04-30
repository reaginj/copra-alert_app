import { Text, View, StyleSheet } from 'react-native';
import { useCopra } from './copraContext';

export default function MonitorDetails() {

  const { hrs, start, timeLeft } = useCopra();   

  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>NAGSIMULA</Text>
          <Text style={styles.value}>{start}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>TAGAL NG SALANG</Text>
          <Text style={styles.value}>{hrs}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottom}>
        <Text style={styles.label}>TANTYANG TAPOS</Text>
        <Text style={styles.timeLeft}>{timeLeft}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderTopWidth: 6,
    borderWidth: 1,
    borderColor: '#C7B79B',
    borderTopColor: '#C7B79B',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
  },

  item: {
    flex: 1,
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: '#4A3728',
    opacity: 0.7,
    marginBottom: 4,
  },

  value: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A3728',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8DED1',
    marginVertical: 14,
  },

  bottom: {
    alignItems: 'center',
  },

  timeLeft: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E6B4D',
  },
});