import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthBrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <View style={styles.logoSurface}>
          <View style={styles.logoHighlight} />
          <Image
            source={require('@/assets/images/coconut-logo.svg')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      </View>

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
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#8A5A34',
    borderWidth: 1,
    borderColor: '#C79A58',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  logoSurface: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFF1D5',
    borderWidth: 1,
    borderColor: '#E6C88F',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoHighlight: {
    position: 'absolute',
    top: 7,
    left: 14,
    width: 38,
    height: 15,
    borderRadius: 12,
    backgroundColor: '#FFF9EA',
    opacity: 0.75,
  },
  logo: {
    width: 62,
    height: 62,
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
