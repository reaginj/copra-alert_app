import { Text, View, StyleSheet } from 'react-native';
import { useCopra } from './copraContext';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

export default function MonitorDetails() {

  const { hrs, start, timeLeft } = useCopra();   
  const totalTime = 30; 
  const remaining = parseFloat(timeLeft); 
  const progress = (totalTime - remaining) / totalTime;

  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>DRYING STATUS</Text>

        <View style={styles.row}>

          <View style={styles.leftSection}>
            <Ionicons name="time-outline" size={40} color="#134227" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Oras na Nakasalang</Text>
              <Text style={styles.hrsOn}>{hrs}</Text>
            </View>
          </View>

          <View style={styles.middleDivider}>
            <View style={styles.verticalDivider} />
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.label}>Simula</Text>
            <Text style={styles.hrsOn}>{start}</Text>
          </View>

        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TANTYANG TAPOS</Text>

        <View style={styles.row}>

          <View style={styles.leftSection}>
            <Ionicons name="hourglass-outline" size={40} color="#134227" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.estimate}>{timeLeft}</Text>
              <Text style={styles.subtitle}>Tinatantya: 4:00PM</Text>
            </View>
          </View>

          <View style={[styles.middleDivider, styles.tantyaDivider]}>
            <View style={styles.verticalDivider} />
          </View>

          <View style={styles.progress}>
            <Progress.Circle
              size={80}
              progress={progress}
              showsText
              color="#134227"
              thickness={8}
              borderWidth={0}
            />
          </View>

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FBF7F1',
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    marginTop: 5,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardTitle: {
    fontSize: 17,
    color: '#4A3728',
    marginBottom: 12,
    fontWeight: '600',
    opacity: 0.9,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5, 
  },

  middleDivider: {
    width: 30, 
    alignItems: 'center',
  },

  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },

  label: {
    fontSize: 14,
    color: '#8A7A6C',
  },

  hrsOn: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 2,
  },

  estimate: {
    fontSize: 32,
    fontWeight: '500',
    color: '#2F5D3A',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 2,
    opacity: 0.6,
  },

  tantyaDivider: {
  marginLeft: -1 
},

progress: {
  flex: 1,
  alignItems: "center",
  marginTop: -15  
}
});