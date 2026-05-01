import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatureTemp from '@/components/copra/featureTemp';
import DashboardAlertCard from '@/components/copra/DashbordAlert';
import ProductCard from '@/components/copra/productCard';
import DryProgress from '@/components/copra/dryProgress';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Copra-Alert</Text>
          <Text style={styles.subtitle}>Monitoring and Supply Chain System</Text>
        </View>
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
  title_card: {
    fontSize: 19,
    color: '#4A3728',
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#F6F1B9',
    textAlign: 'left',
    paddingTop: 3,
  },
  content: {
    flex: 1,
    padding: 13,
  },
});