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
            <Ionicons name="time-outline" size={50} color="#134227" />
              <View style={styles.item}>
                <Text style={styles.label}>Oras na Nakasalang</Text>
                <Text style={styles.hrsOn}>{hrs}</Text>
              </View>

              <Text style={styles.separator}>•</Text>

              <View style={styles.item}>
                <Text style={styles.label}>Simula</Text>
                <Text style={styles.hrsOn}>{start}</Text>
              </View>
              
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>TANTYANG TAPOS</Text>

          <View style={styles.rowBetween}>
            <View style={styles.item1}>
              <Text style={styles.estimate}>{timeLeft}</Text>
              <Text style={styles.subtitle}>Tinatantya: 4:00PM</Text>
            </View>

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

  

  );
}

const styles = StyleSheet.create({
  container: {
  backgroundColor: 'transparent',
  marginBottom: 12,
},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
},

item: {
  marginLeft: 12,
},
item1: {
  
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

cardTitle: {
  fontSize: 17,
  color: '#4A3728',
  marginBottom: 8,
  fontWeight: '600',
  opacity: 0.9
},

separator: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#B0A89F',
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

estimate: {
  fontSize: 35,
  fontWeight: '500',
  color: '#2F5D3A',

},

subtitle: {
  fontSize: 15,
  marginTop: 1,
  opacity: 0.6
},

rowBetween: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});