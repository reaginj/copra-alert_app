import { StyleSheet, Text, View } from "react-native";  
import { LinearGradient } from 'expo-linear-gradient';
import { useCopra } from "./copraContext";

export default function FeatureTemp() {
  const {temp, hrs} = useCopra();

  const getStatus = (temp: number) => {
  if (temp < 40) {
    return { label: "Mababa",
      bgcolor: "#134227",
      dotColor: "#3498db" };
  } else if (temp <= 60) {
    return { label: "Normal",
      bgcolor: "#134227",
      dotColor: "#2ecc71" };
  } else if (temp <= 75) {
    return { label: "Babala", 
      bgcolor: "#134227",
      dotColor: "#f1c40f" };
  } else {
    return { label: "Kritikal", 
      bgcolor: "#134227",
      dotColor: "#e74c3c" };
  }
};

const maxTemp = 100;
const progress = Math.min(temp / maxTemp, 1);
const progressWidth = `${progress * 100}%` as `${number}%`;


  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>KASALUKUYANG NAKASALANG</Text>

      <View style={styles.tempRow}>
        <Text style={styles.temp}>
          {temp}
          <Text style={styles.degree}> °C</Text>
        </Text>

        <View style={[styles.statusCont, { backgroundColor: getStatus(temp).bgcolor }]}>
            <View style={[styles.dot, { backgroundColor: getStatus(temp).dotColor }]} />
            <Text style={styles.statusText}>{getStatus(temp).label}</Text>
        </View>
      </View>

   <View style={styles.progressBarBg}>
      <LinearGradient
    colors={['#62d492', '#ecb358', '#f07669']} 
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[
      styles.progressBarFill,
      { width: progressWidth }
    ]}
      />
    </View>

      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#F6F1B9",
          marginVertical: 8,
          alignSelf: "center",
          opacity: 0.5,
        }}
      />

      <Text style={styles.hrs}>ORAS NA NAKASALANG
        <Text style={styles.time}>        {hrs}</Text>
      </Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#275844',
        borderRadius: 13,
        padding: 15,
        marginTop: 5,
    },
    degree: {
        fontSize: 30,
        fontWeight: '500',
        color: '#FFFEFE',
        opacity: 0.7,
    },
    temp: {
        fontSize: 70,
        fontWeight: '700',
        color: '#ffffff',
    },
    hrs: {
        fontSize: 17,
        color: '#9FCFBC',
        fontWeight: '500',
    },
    time: {
        fontSize: 20,
        fontWeight: '400',
        color: '#f8f0e3',
    },
    cardTitle: {
        fontSize: 17,
        color: '#9FCFBC',
        marginBottom: 8,
        fontWeight: '600',
    },
    statusCont: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
        marginRight: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#ffdddd',
        fontWeight: '500',
    },
    tempRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
},
    progressBarBg: {
        height: 8,
        width: "100%",
        backgroundColor: "#134227",
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 5,
        overflow: "hidden",
},
    progressBarFill: {
        height: "100%",
        borderRadius: 20,
    },
});