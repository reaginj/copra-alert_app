import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from './ScopeUI';

type Props = {
  value: Date;
  onChange: (value: Date) => void;
  mode: 'date' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
};

export default function DatePickerField({ value, onChange, mode, maximumDate, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');

  const openPicker = () => {
    setDraft(value);
    setAndroidStep('date');
    setOpen(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) return setOpen(false);
    if (mode === 'datetime' && androidStep === 'date') {
      const next = new Date(draft);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDraft(next);
      setAndroidStep('time');
      return;
    }
    const next = new Date(draft);
    if (androidStep === 'time') next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    else next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    onChange(next);
    setOpen(false);
  };

  const label = mode === 'date'
    ? value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : value.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return <>
    <TouchableOpacity style={styles.field} activeOpacity={0.78} onPress={openPicker} accessibilityRole="button">
      <Text style={styles.value}>{label}</Text><Ionicons name="calendar-outline" size={19} color={palette.green} />
    </TouchableOpacity>
    {Platform.OS === 'android' && open ? <DateTimePicker
      value={draft}
      mode={mode === 'datetime' && androidStep === 'time' ? 'time' : 'date'}
      maximumDate={androidStep === 'date' ? maximumDate : undefined}
      minimumDate={androidStep === 'date' ? minimumDate : undefined}
      onChange={onAndroidChange}
    /> : null}
    {Platform.OS === 'ios' ? <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close date picker" />
        <View style={styles.dialog}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setOpen(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <Text numberOfLines={1} style={styles.title}>{mode === 'date' ? 'Select date' : 'Select date and time'}</Text>
            <TouchableOpacity style={styles.headerButton} onPress={() => { onChange(draft); setOpen(false); }}><Text style={styles.done}>Done</Text></TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={draft}
              mode={mode}
              display={mode === 'date' ? 'inline' : 'spinner'}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant="light"
              textColor={palette.ink}
              accentColor={palette.green}
              style={[styles.picker, mode === 'date' ? styles.calendarPicker : styles.timePicker]}
              onChange={(_, selected) => selected && setDraft(selected)}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal> : null}
  </>;
}

const styles = StyleSheet.create({
  field: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderWidth: 1, borderColor: '#D5DAD3', borderRadius: 12, paddingHorizontal: 13, backgroundColor: palette.white },
  value: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24, backgroundColor: '#13251BA6' },
  dialog: { width: '100%', maxWidth: 420, maxHeight: '92%', overflow: 'hidden', backgroundColor: '#FFFDF8', borderRadius: 22, borderWidth: 1, borderColor: '#E3E4DA', shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line, backgroundColor: palette.cream },
  headerButton: { minWidth: 62, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  title: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' }, cancel: { color: palette.muted, fontSize: 14, fontWeight: '700' }, done: { color: palette.green, fontSize: 14, fontWeight: '900' },
  pickerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#FFFDF8' },
  picker: { width: '100%', alignSelf: 'center' }, calendarPicker: { height: 340 }, timePicker: { height: 216 },
});
