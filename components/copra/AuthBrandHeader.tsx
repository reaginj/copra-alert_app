import { StyleSheet, Text } from 'react-native';

export default function AuthBrandHeader() {
  return (
    <>
      <Text style={styles.logo}>ðŸ¥¥</Text>
      <Text style={styles.title}>COPRA ALERT</Text>
      <Text style={styles.subtitle}>
        Connecting Farmers to Markets, Better Together.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 60,
    textAlign: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#145A2A',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
    marginTop: 8,
    marginBottom: 28,
  },
});
