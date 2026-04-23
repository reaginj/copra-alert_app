import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatureTemp from '@/components/copra/featureTemp';
import AlertCard from '@/components/copra/alertCard';
import ProductCard from '@/components/copra/productCard';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Copra-Alert</Text>
          <View style={{ height: 1, width: '70%', backgroundColor: '#F6F1B9', marginVertical: 8, alignSelf: 'center', opacity: 0.5 }} />
          <Text style={styles.subtitle}> Monitoring and Supply Chain System</Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <FeatureTemp />
        <Text style={styles.title_card}>MGA ALERTO</Text>
        <AlertCard />
        <ProductCard />
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
    textAlign: 'center',
  },
  title_card: {
    fontSize: 19,
    color: '#4A3728',
    marginBottom: 8,
    marginTop: 20,
    fontWeight: '600',
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