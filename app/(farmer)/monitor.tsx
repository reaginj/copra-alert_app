import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import MonitorDetails from '@/components/copra/monitorDetail';
import LiveMonitorCard from '@/components/copra/LiveMonitorCard';


export default function MonitorScreen() {

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Monitor"
          subtitle="Current Drying View"
          profileRoute="/(farmer)/profile"
        />
      </SafeAreaView>

      <View style={styles.content}>
        <LiveMonitorCard />
        <MonitorDetails />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f0e3',
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
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#F6F1B9',
    textAlign: 'left',
    paddingTop: 3
  },
  content: {
    flex: 1,
    padding: 13,
  },
});
