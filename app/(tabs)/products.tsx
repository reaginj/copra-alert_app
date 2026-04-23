import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <Text>Screen content here</Text>
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