import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View, StyleSheet } from 'react-native';

export default function AlertCard() {
  const alerts = [
    {
      id: 1,
      title: 'Delikado: Sobrang Init',
      detail: 'Pahinaan ang apoy',
      color: '#D9534F',
    },
    {
      id: 2,
      title: 'Babala: Tumataas ang Init',
      detail: 'Bantayan ang apoy',
      color: '#F0AD4E',
    },
  ];

  return (
    <View style={styles.container}>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[styles.alertBox, { borderLeftColor: alert.color }]}
        >
          <View style={styles.row}>
            <MaterialIcons name="warning" size={24} color={alert.color} />

            <View style={styles.textContainer}>
              <Text style={styles.message}>{alert.title}</Text>
              <Text style={styles.messageDetail}>{alert.detail}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 10,
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2F25',
  },
  messageDetail: {
    fontSize: 13,
    color: '#6E7C74',
    marginTop: 4,
  },
});