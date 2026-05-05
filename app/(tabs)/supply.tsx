import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Supply Chain"

        />
      </SafeAreaView>

      <View style={styles.content}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F4',
  },
  topSafeArea: {
    backgroundColor: '#4A3728',
  },
  header: {
    backgroundColor: '#4A3728',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#F6F1B9',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});