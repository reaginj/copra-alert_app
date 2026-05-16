import { useState } from 'react';
import { StyleSheet, View, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeliveryHistoryCard from '@/components/copra/DeliveryHistoryCard';
import DeliveryDatePickerModal from '@/components/copra/DeliveryDatePickerModal';
import DeliveryRecordingCard from '@/components/copra/DeliveryRecordingCard';
import Header from '@/components/copra/Header';
import TransactionSummaryCard from '@/components/copra/TransactionSummaryCard';
import WarehouseInfoCard from '@/components/copra/WarehouseInfoCard';

export default function HomeScreen() {
  const [warehouseDestination, setWarehouseDestination] = useState('');
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

  const handleMonthChange = (value: string) => {
    setTempMonth(value);

    const maxDays = getDaysInMonth(value, tempYear);
    if (Number(tempDay) > maxDays) {
      setTempDay(String(maxDays));
    }
  };

  const handleYearChange = (value: string) => {
    setTempYear(value);

    const maxDays = getDaysInMonth(tempMonth, value);
    if (Number(tempDay) > maxDays) {
      setTempDay(String(maxDays));
    }
  };

  const handleSaveDelivery = () => {
    const deliveryRecord = {
      warehouseDestination,
      quantity,
      pricePerKg: price,
      deliveryDate: formatSelectedDate(),
    };

    console.log(deliveryRecord);
  };

  const daysInSelectedMonth = getDaysInMonth(tempMonth, tempYear);

  return (
    <View style={styles.screen}>
      <View style={styles.mainContent}>
        <SafeAreaView edges={['top']} style={styles.topSafeArea}>
          <Header
            title="Supply Chain"
            subtitle="Copra Supply and Inventory Tracking"
            profileRoute="/(farmer)/profile"
          />
        </SafeAreaView>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <DeliveryRecordingCard
            warehouseDestination={warehouseDestination}
            quantity={quantity}
            price={price}
            selectedDate={formatSelectedDate()}
            onWarehouseDestinationChange={setWarehouseDestination}
            onQuantityChange={setQuantity}
            onPriceChange={setPrice}
            onOpenDatePicker={openDatePicker}
            onSaveDelivery={handleSaveDelivery}
          />

          <WarehouseInfoCard />
          <TransactionSummaryCard />
          <DeliveryHistoryCard />
        </ScrollView>
      </View>

      <DeliveryDatePickerModal
        visible={showDateModal}
        months={months}
        years={years}
        tempMonth={tempMonth}
        tempDay={tempDay}
        tempYear={tempYear}
        daysInSelectedMonth={daysInSelectedMonth}
        onMonthChange={handleMonthChange}
        onDayChange={setTempDay}
        onYearChange={handleYearChange}
        onConfirm={confirmDate}
        onClose={() => setShowDateModal(false)}
      />
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});
