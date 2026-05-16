import { StyleSheet, Text, View } from 'react-native';

export default function OutputComputationCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Output Computation</Text>

      <View style={styles.outputRow}>
        <View style={styles.outputBox}>
          <Text style={styles.labelOutput}>Total Output</Text>
          <Text style={styles.outputValue}>240 kg</Text>
        </View>

        <View style={styles.outputBox}>
          <Text style={styles.labelOutput}>Estimated Value</Text>
          <Text style={styles.outputValue}>14,520</Text>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  outputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outputBox: {
    flex: 1,
    minHeight: 105,
    borderRadius: 16,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  labelOutput: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  outputValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1E8A3A',
    textAlign: 'center',
  },
});
