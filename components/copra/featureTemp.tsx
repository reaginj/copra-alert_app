import { StyleSheet, Text, View } from "react-native";  
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeatureTemp() {
    return (
        <View style={styles.container}>
            <Text style={styles.cardTitle}>KASALUKUYANG NAKASALANG</Text>
            <Text style={styles.temp}> 78 
                <Text style={styles.degree}> °C</Text> 
            </Text> 
             <View style={{ height: 1, width: '100%', backgroundColor: '#F6F1B9', marginVertical: 8, alignSelf: 'center', opacity: 0.5 }} />
             <Text style={styles.hrs}>ORAS NA NAKASALANG 
                <Text style={styles.time}>       4hr 20min </Text>
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
        color: '#f8e7e3',
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
});