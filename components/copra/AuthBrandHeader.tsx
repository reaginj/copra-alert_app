import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthBrandHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/coconut-logo.svg')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Copra Alert coconut logo"
      />

      <Text style={styles.title}>Copra Alert</Text>
      <Text style={styles.subtitle}>
        Monitoring and supply chain support for farmers and warehouses.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 98,
    height: 90,
    marginBottom: 12,
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    color: '#3E2A1E',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#6A5848',
    marginTop: 8,
    paddingHorizontal: 12,
    maxWidth: 330,
    fontWeight: '500',
  },
});
