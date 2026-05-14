import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Keyboard, TouchableOpacity, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/build/Ionicons';

export default function HomeScreen() {
  const [buyer, setBuyer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const currentDate = new Date();

  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [day, setDay] = useState(String(currentDate.getDate()));
  const [year, setYear] = useState(String(currentDate.getFullYear()));

  const [tempMonth, setTempMonth] = useState(month);
  const [tempDay, setTempDay] = useState(day);
  const [tempYear, setTempYear] = useState(year);

  const [showDateModal, setShowDateModal] = useState(false);

  const months = [
    { label: 'Jan', value: '1' },
    { label: 'Feb', value: '2' },
    { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' },
    { label: 'May', value: '5' },
    { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' },
    { label: 'Aug', value: '8' },
    { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
  ];

  const years = ['2025', '2026', '2027', '2028', '2029', '2030'];

  const getDaysInMonth = (selectedMonth: string, selectedYear: string) => {
    return new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
  };

  const formatSelectedDate = () => {
    const monthName = months.find((m) => m.value === month)?.label;
    return `${monthName} ${day}, ${year}`;
  };

  const openDatePicker = () => {
    Keyboard.dismiss();

    setTempMonth(month);
    setTempDay(day);
    setTempYear(year);

    setShowDateModal(true);
  };

  const confirmDate = () => {
    setMonth(tempMonth);
    setDay(tempDay);
    setYear(tempYear);
    setShowDateModal(false);
  };

  const handleSaveDelivery = () => {
    const deliveryRecord = {
      buyer,
      quantity,
      pricePerKg: price,
      deliveryDate: formatSelectedDate(),
    };

    console.log(deliveryRecord);
  };

  const daysInSelectedMonth = getDaysInMonth(tempMonth, tempYear);

  return (
    <View style={styles.screen}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContent}>
          <SafeAreaView edges={['top']} style={styles.topSafeArea}>
            <Header
              title="Supply Chain"
              subtitle="Copra Supply and Inventory Tracking"
            />
          </SafeAreaView>

          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Delivery Recording</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <FontAwesome5 name="truck" size={40} color="#1E8A3A" />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.inputRow}>
                    <Text style={styles.label}>Buyer / Trader</Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Enter buyer"
                      placeholderTextColor="#888"
                      value={buyer}
                      onChangeText={setBuyer}
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
                      onChangeText={setQuantity}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>Price per kg</Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Enter price"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>Delivery Date</Text>

                    <TouchableOpacity
                      style={styles.dateInput}
                      activeOpacity={0.7}
                      onPress={openDatePicker}
                    >
                      <Text style={styles.dateText}>{formatSelectedDate()}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    activeOpacity={0.8}
                    onPress={handleSaveDelivery}
                  >
                    <Text style={styles.saveText}>Save Delivery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Buyer / Trader Information</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.traderBox}>
              <Ionicons name="person" size={25} color="#1E8A3A" />
            </View>

            
            <View style={styles.traderName}>
              <View style={styles.traderRow}>
              <Text style={styles.label}>Juan Dela Cruz</Text>
              <Text style={styles.totalDelivery}>Total Deliveries</Text>
              </View>

              <View style={styles.traderRow}>
                <Text style={styles.sub}>09123456789</Text>
                <Text style={styles.totalDelivery}>5</Text>
              </View>

            </View>
          </View>
        </View>


          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDateModal(false)}
        >
          <Pressable style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Delivery Date</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerBox}>
                <Text style={styles.pickerLabel}>Month</Text>
                <Picker
                  selectedValue={tempMonth}
                  onValueChange={(value) => {
                    setTempMonth(value);

                    const maxDays = getDaysInMonth(value, tempYear);
                    if (Number(tempDay) > maxDays) {
                      setTempDay(String(maxDays));
                    }
                  }}
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
                  onValueChange={setTempDay}
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
                  onValueChange={(value) => {
                    setTempYear(value);

                    const maxDays = getDaysInMonth(tempMonth, value);
                    if (Number(tempDay) > maxDays) {
                      setTempDay(String(maxDays));
                    }
                  }}
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

            <TouchableOpacity style={styles.confirmButton} onPress={confirmDate}>
              <Text style={styles.confirmText}>Confirm Date</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

       
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F4',
  },

  mainContent: {
    flex: 1,
  },

  topSafeArea: {
    backgroundColor: '#4A3728',
  },

  content: {
    flex: 1,
    padding: 20,
  },

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
    alignItems: 'center',
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

  traderBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
  },

  traderName: {
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

  traderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  sub: {
    fontSize: 11,
    color: '#555555',
  },

  totalDelivery: {
    fontSize: 11,
    color: '#555555',
    
  },
});