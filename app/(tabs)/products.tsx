import Header from '@/components/copra/Header';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Product() {
  return (
    <View style={styles.screen}>
          <SafeAreaView edges={['top']} style={styles.topSafeArea}>
            <Header
              title="Products"
              subtitle= "Drying Results and Copra Output"

            />
          </SafeAreaView>
    
          <View style={styles.content}>

            <View style= {styles.card}>
              <Text style= {styles.cardTitle}>Weight Measurement </Text>

              <View style= {styles.row}>

                <View style={styles.iconBox}>
                  <Ionicons name="scale-outline" size={60} color="#1E8A3A" />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.label}>Kasalukuyang Timbang</Text>
                  <Text style={styles.weight}>240 kg</Text>
                  <Text style={styles.sub}>---</Text>
                </View>
              
              </View>
            </View>

            <View style= {styles.card}>
              <Text style= {styles.cardTitle}>Output Computation</Text>


            </View>

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

  },
  subtitle: {
    fontSize: 14,
    color: '#F6F1B9',
    paddingTop: 3

  },
  content: {
    flex: 1,
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14, 
    borderWidth: 1,
    borderColor: '#fff',

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  label: {
    fontSize: 13,
    color: '#333',
  },

  weight: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E8A3A',
  },

  sub: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },

  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#EAF3E8', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
  },

});