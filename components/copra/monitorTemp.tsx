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
    <View style={[styles.container, { borderTopColor: status.border, borderColor: status.border }]}>
      <View style={styles.row}>

        <View style={styles.itemLeft}>
          <Text style={styles.label}>TEMP</Text>
          <Text style={styles.temp}>
            {temp}
            <Text style={styles.degree}> °C</Text>
            </Text>
        </View>

        <View style={styles.itemCenter}>
          <Text style={styles.label}>STATUS</Text>
          <View style={[styles.statusCont, { backgroundColor: status.bg }]}>
            <View style={[styles.dot, { backgroundColor: status.text }]} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.label}>UPDATE</Text>
          <Text style={styles.update}>{lastUpdate}</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderTopWidth: 6, 
    borderWidth: 1,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  itemLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },

  itemCenter: {
    flex: 1,
    alignItems: 'center',
  },

  itemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },

  label: {
    fontSize: 13,
    color: '#4A3728',
    opacity: 0.7,
    marginBottom: 4,
  },

  temp: {
    fontSize: 36,
    fontWeight: '700',
    color: '#5A3E2B',
  },

  update: {
    fontSize: 18,
    color: '#4A3728',
    marginTop: 10,
    textAlign: 'right',
  },

  statusCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  degree: {
    fontSize: 18,
    color: '#5A3E2B',
    opacity: 0.7,
  }
});