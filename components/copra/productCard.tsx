import {Text, View, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductCard() {

    const testData = {
        weight: "220kg",
        price: "₱45.50"
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.card}>
                    <Text style={styles.weight_title}> WEIGHT</Text>
                    <Text style={styles.weight}> {testData.weight}</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#275844' }]}>
                    <Text style={styles.price_title}> PRESYO </Text>
                    <Text style={styles.price} adjustsFontSizeToFit numberOfLines={1}> {testData.price} </Text>
                </View>
            </View>
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        padding: 10,
        marginBottom: 10,
        marginTop: 13,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    output: {
        backgroundColor: '#f7f3d1',
        borderRadius: 8,
        padding: 10,
    },
    weight: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4A3728',
    },
    card: {
        backgroundColor: '#f8f8f7',
        borderRadius: 8,
        padding: 10,
        width: '48%',

        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    price: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    price_title: {
        fontSize: 17,
        color: '#f8e7e3',
        marginBottom: 3,
        fontWeight: '600',
        opacity: 0.7,
    },
    weight_title: {
        fontSize: 17,
        color: '#5c5652',
        marginBottom: 3,        
        fontWeight: '600',
        opacity: 0.7,
    },
});