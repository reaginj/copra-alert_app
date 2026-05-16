import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BuzzerStatus = 'active' | 'ack' | 'available';

type BuzzerControlBarProps = {
  buzzerStatus: BuzzerStatus;
  onAcknowledge: () => void;
};

export default function BuzzerControlBar({
  buzzerStatus,
  onAcknowledge,
}: BuzzerControlBarProps) {
  return (
    <View style={styles.buzzerContainer}>
      <View style={styles.buzzerRow}>
        <View style={styles.buzzerStatus}>
          <Text style={styles.buzzerText}>
            {buzzerStatus === 'active' && 'Buzzer Active'}
            {buzzerStatus === 'ack' && 'Acknowledged'}
            {buzzerStatus === 'available' && 'Buzzer Available'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.ackButton,
            buzzerStatus === 'available' && { opacity: 0.5 },
          ]}
          onPress={onAcknowledge}
          disabled={buzzerStatus === 'available'}
        >
          <Text style={styles.ackText}>
            {buzzerStatus === 'ack' ? 'Done' : 'Acknowledge'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buzzerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buzzerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#f8f0e3',
  },
  buzzerStatus: {
    flex: 1,
    backgroundColor: '#FFF4E5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
  },
  ackButton: {
    flex: 1,
    backgroundColor: '#4A3728',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buzzerText: {
    fontWeight: '600',
    color: '#4A3728',
  },
  ackText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
