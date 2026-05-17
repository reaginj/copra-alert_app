import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthBrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoShadow}>
        <View style={styles.logoBadge}>
          <Ionicons name="leaf-outline" size={38} color="#F7F0C2" />
          <View style={styles.alertDot} />
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
    marginBottom: 24,
  },
  logoShadow: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#D8B57A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4A3728',
    borderWidth: 3,
    borderColor: '#F2DEB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    position: 'absolute',
    right: 17,
    top: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F9E44',
    borderWidth: 2,
    borderColor: '#F7F0C2',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#4A3728',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#6E5A43',
    marginTop: 8,
    paddingHorizontal: 12,
    maxWidth: 330,
    fontWeight: '600',
  },
});
