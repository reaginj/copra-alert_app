import { StyleSheet, Text, View } from "react-native";  
import { Image } from 'react-native';

export default function CamShot() {
  return (
    <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>LIVE VIEW NG PUGON </Text>
            <Text style={styles.subtitle}> (Update every 10 minutes) </Text>
          </View>
            <Image 
                source={require('@/assets/images/Copra_Drying.jpg')}
                style={styles.image}
            />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f0e3',
    marginBottom: 10,
  },
    title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3728', 
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#4A3728',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {

    padding: 3,
    },
  text: {
    fontSize: 18,
    color: '#f0e7e0',
    paddingTop: 10,
    },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    },
  card: {
    backgroundColor: '#4A3728',
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: '50%',
    },
  image: {
    width: 385, 
    height: 200, 
    borderRadius: 10, 
    borderColor: '#4A3728', 
    borderWidth: 2, 
    marginBottom: 10, 
    alignSelf: 'center'
    },
});