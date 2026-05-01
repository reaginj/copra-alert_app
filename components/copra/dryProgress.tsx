import {Text, View, StyleSheet} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DryProgress() {

    const testData = {
        temp: 50
    }


const maxTemp = 100;
const progress = Math.min(testData.temp / maxTemp, 1);
const progressWidth = `${progress * 100}%` as `${number}%`;
    
    return (
        <View style={styles.container}>
            <Text style={styles.cardTitle}>PAGTUTUYOT NG COPRA</Text>
            <Text style={styles.progressText}>Tinatayang {Math.round(progress * 100)}% tuyo</Text>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, {
                 width: progressWidth,
                backgroundColor: '#C89B6D',
                }]} 
               
               />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        padding: 13,
        backgroundColor: '#ffffff',
        marginBottom: 10,

        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#4A3728',
        marginBottom: 10,
    },
    progressBarBg: {
        height: 8,
        width: "100%",
        backgroundColor: "#f0eded",
        borderRadius: 20,
        marginBottom: 5,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 20,
    },
    progressText: {
        fontSize: 15,
        color: '#4A3728',
        fontWeight: '400',
        marginBottom: 10,
    },
});