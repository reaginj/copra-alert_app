import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCopra } from './copraContext';

export default function MonitorTemp() {

  const { temp, lastUpdate } = useCopra();    

  const getStatus = (temp: number) => {
    if (temp < 40) {
      return {
        label: "Mababa",
        border: "#3F7FA8",
        bg: "#EAF3F8",
        text: "#3F7FA8",
      };
    } else if (temp <= 60) {
      return {
        label: "Normal",
        border: "#3E7D5B",
        bg: "#EAF5EE",
        text: "#3E7D5B",
      };
    } else if (temp <= 75) {
      return {
        label: "Babala",
        border: "#C99A24",
        bg: "#FFF4D8",
        text: "#9A7418",
      };
    } else {
      return {
        label: "Kritikal",
        border: "#B9382A",
        bg: "#FCEDEA",
        text: "#B9382A",
      };
    }
  };

  const status = getStatus(temp);

  return (
    <View style={[styles.container, { borderTopColor: status.border }]}>
      
      <View style={styles.row}>

        {/* TEMP */}
        <Text style={[styles.temp, {color: status.text}]}>
          {temp}
          <Text style={styles.degree}>°C</Text>
        </Text>

        {/* BULLET */}
        <Text style={styles.separator}>•</Text>

        {/* STATUS */}
        <View style={[styles.statusCont, { backgroundColor: status.bg }]}>
          <View style={[styles.dotCircle, { backgroundColor: status.text }]} />
          <Text style={[styles.statusText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>

        {/* BULLET */}
        <Text style={styles.separator}>•</Text>

        {/* UPDATE */}
        <Text style={styles.update}>{lastUpdate}</Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#FBF7F1',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,

    borderTopWidth: 6,


    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap', 
    gap: 10,
  },

  temp: {
    fontSize: 45,
    fontWeight: '700',
  },

  degree: {
    fontSize: 16,
    color: '#5A3E2B',
    opacity: 0.7,
  },

  separator: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#B0A89F',
  },

  statusCont: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  dotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  update: {
    fontSize: 16,
    color: '#4A3728',
  },

});