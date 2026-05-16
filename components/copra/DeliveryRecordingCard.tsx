import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type DeliveryRecordingCardProps = {
  warehouseDestination: string;
  quantity: string;
  price: string;
  selectedDate: string;
  onWarehouseDestinationChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onOpenDatePicker: () => void;
  onSaveDelivery: () => void;
};

export default function DeliveryRecordingCard({
  warehouseDestination,
  quantity,
  price,
  selectedDate,
  onWarehouseDestinationChange,
  onQuantityChange,
  onPriceChange,
  onOpenDatePicker,
  onSaveDelivery,
}: DeliveryRecordingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Delivery Recording</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <FontAwesome5 name="warehouse" size={36} color="#1E8A3A" />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Warehouse Destination</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter warehouse"
              placeholderTextColor="#888"
              value={warehouseDestination}
              onChangeText={onWarehouseDestinationChange}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Quantity (kg)</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={quantity}
              onChangeText={onQuantityChange}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Price per kg (₱)</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={price}
              onChangeText={onPriceChange}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Delivery Date</Text>

            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.7}
              onPress={onOpenDatePicker}
            >
              <Text style={styles.dateText}>{selectedDate}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={onSaveDelivery}
          >
            <Text style={styles.saveText}>Save Delivery</Text>
          </TouchableOpacity>
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
    alignItems: 'flex-start',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
    flex: 1,
  },
  input: {
    width: 130,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    color: '#111111',
  },
  dateInput: {
    width: 130,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 13,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#1E8A3A',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
