import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default function MonitorTemp() {
  const temperature = 35; 
    return (
        <View style={styles.container}>
                <View style={styles.tempContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.label}>KASALUKUYANG INIT</Text>
                        <Text style={styles.label}>STATUS</Text>
                        <Text style={styles.label}>HULING UPDATE</Text>
                    </View>
                    <Text style={styles.temperature}>{temperature}°C</Text>
                    <Text style={styles.text}>Temp</Text>
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        marginBottom: 10,

    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4A3728',
        marginBottom: 5,
    },
    temperature: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4A3728',
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A3728',
    },
    tempContainer: {
        backgroundColor: '#f8f8f7',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    }
});