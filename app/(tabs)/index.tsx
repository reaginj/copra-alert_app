import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import FeatureTemp from '@/components/copra/featureTemp';
import DashboardAlertCard from '@/components/copra/DashbordAlert';
import ProductCard from '@/components/copra/productCard';
import DryProgress from '@/components/copra/dryProgress';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Copra-Alert"
          subtitle="Monitoring and Supply Chain System"
        />
      </SafeAreaView>

      <View style={styles.content}>
        <FeatureTemp />
        <Text style={styles.title_card}> MGA ALERTO</Text>
        <DashboardAlertCard />
        <ProductCard />
        <DryProgress/>
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
  title_card: {
    fontSize: 19,
    color: '#4A3728',
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 13,
  },
});