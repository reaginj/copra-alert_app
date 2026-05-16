import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type MonthOption = {
  label: string;
  value: string;
};

type DeliveryDatePickerModalProps = {
  visible: boolean;
  months: MonthOption[];
  years: string[];
  tempMonth: string;
  tempDay: string;
  tempYear: string;
  daysInSelectedMonth: number;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeliveryDatePickerModal({
  visible,
  months,
  years,
  tempMonth,
  tempDay,
  tempYear,
  daysInSelectedMonth,
  onMonthChange,
  onDayChange,
  onYearChange,
  onConfirm,
  onClose,
}: DeliveryDatePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.modalBox}>
          <Text style={styles.modalTitle}>Select Delivery Date</Text>

          <View style={styles.pickerRow}>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerLabel}>Month</Text>
              <Picker
                selectedValue={tempMonth}
                onValueChange={onMonthChange}
                style={styles.picker}
              >
                {months.map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    color="#333333"
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerBoxSmall}>
              <Text style={styles.pickerLabel}>Day</Text>
              <Picker
                selectedValue={tempDay}
                onValueChange={onDayChange}
                style={styles.picker}
              >
                {Array.from({ length: daysInSelectedMonth }, (_, i) => (
                  <Picker.Item
                    key={i + 1}
                    label={`${i + 1}`}
                    value={`${i + 1}`}
                    color="#333333"
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerBox}>
              <Text style={styles.pickerLabel}>Year</Text>
              <Picker
                selectedValue={tempYear}
                onValueChange={onYearChange}
                style={styles.picker}
              >
                {years.map((item) => (
                  <Picker.Item
                    key={item}
                    label={item}
                    value={item}
                    color="#333333"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>Confirm Date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pickerBox: {
    flex: 1,
  },
  pickerBoxSmall: {
    width: 90,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  picker: {
    backgroundColor: '#F6F8F4',
    borderRadius: 8,
    color: '#333333',
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: '#1E8A3A',
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#4A3728',
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
});
