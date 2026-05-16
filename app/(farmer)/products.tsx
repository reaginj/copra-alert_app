import Header from '@/components/copra/Header';
import BatchRecordingCard from '@/components/copra/BatchRecordingCard';
import OutputComputationCard from '@/components/copra/OutputComputationCard';
import ProductionHistoryCard from '@/components/copra/ProductionHistoryCard';
import WeightMeasurementCard from '@/components/copra/WeightMeasurementCard';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Product() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Products"
          subtitle="Drying Results and Copra Output"
          profileRoute="/(farmer)/profile"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WeightMeasurementCard />
        <OutputComputationCard />
        <BatchRecordingCard />
        <ProductionHistoryCard />

        <View style={styles.bottomSpace} />
      </ScrollView>
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

  content: {
    flex: 1,
    padding: 20,
  },

  bottomSpace: {
    height: 30,
  },
});
