import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import AlertItem from '@/components/copra/AlertItem';


type AlertType = 'Delikado' | 'Babala' | 'Normal';
type FilterType = 'All' | 'Babala' | 'Delikado';

type AlertData = {
  type: AlertType;
  title: string;
  message: string;
  temp: string;
  time: string;
  status: 'active' | 'recent';
};

export default function Alerts() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAcknowledge = () => {
  setIsAcknowledged(true);

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(() => {
    setIsAcknowledged(false);
  }, 30000);
};

  const alerts: AlertData[] = [
    {
      type: 'Delikado',
      title: 'Sobrang Init',
      message: 'Pahinaan ang apoy',
      temp: '85°C',
      time: '2 mins ago',
      status: 'recent',
    },
    {
      type: 'Babala',
      title: 'Tumataas ang Init',
      message: 'Bantayan ang pugon',
      temp: '58°C',
      time: '5 mins ago',
      status: 'active',
    },
    {
      type: 'Normal',
      title: 'Normal Temperature',
      message: 'Bumalik na sa normal ang init',
      temp: '46°C',
      time: '20 mins ago',
      status: 'recent',
    },
   {
      type: 'Babala',
      title: 'Temperature Rising',
      message: 'Unti-unting tumataas ang init',
      temp: '75°C',
      time: '5 mins ago',
      status: 'active'
    },
    {
      type: 'Babala',
      title: 'Unstable Heat',
      message: 'Hindi pantay ang init sa drying area',
      temp: '70°C',
      time: '25 mins ago',
      status: 'recent'
    },
    {
      type: 'Delikado',
      title: 'Overheating Detected',
      message: 'Sobrang taas ng init, posibleng masunog ang copra',
      temp: '92°C',
      time: '2 mins ago',
      status: 'recent'
    },
    {
      type: 'Delikado',
      title: 'Burn Risk',
      message: 'Patuloy ang pagtaas ng temperatura',
      temp: '88°C',
      time: '10 mins ago',
      status: 'active'
    },
    
    
  ];

  const hasCritical = alerts.some(
  a => a.type === 'Delikado' && a.status === 'active'
  );
    let buzzerStatus;

    if (!hasCritical) {
      buzzerStatus = 'available';
    } else if (isAcknowledged) {
      buzzerStatus = 'ack';
    } else {
      buzzerStatus = 'active';
    }

  const filteredAlerts =
    filter === 'All'
      ? alerts
      : alerts.filter((alert) => alert.type === filter);

  const activeAlerts = filteredAlerts.filter(
    (alert) => alert.status === 'active')
    .slice(0, 3);

  const recentAlerts = filteredAlerts.filter(
    (alert) => alert.status === 'recent')
    .slice(0,2);


  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
            title="Alerts"
            subtitle= "Live updates and warnings"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {(['All', 'Babala', 'Delikado'] as FilterType[]).map((item) => (
            <Text
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filter, filter === item && styles.filterActive]}
            >
              {item}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ACTIVE ALERTS</Text>

        {activeAlerts.length === 0 ? (
          <Text style={styles.empty}>No active alerts</Text>
        ) : (
          activeAlerts.map((alert, index) => (
            <AlertItem key={index} {...alert} />
          ))
        )}

        <Text style={styles.sectionTitle}>RECENT ALERTS</Text>

        {recentAlerts.length === 0 ? (
          <Text style={styles.empty}>No recent alerts</Text>
        ) : (
          recentAlerts.map((alert, index) => (
            <AlertItem key={index} {...alert} />
          ))
        )}

      </ScrollView>

      <View style={styles.buzzerContainer}>
        <View style={styles.buzzerRow}>
          <View style={styles.buzzerStatus}>
            <Text style={styles.buzzerText}>
              {buzzerStatus === 'active' && 'Buzzer Active'}
              {buzzerStatus === 'ack' && 'Acknowledged'}
              {buzzerStatus === 'available' && 'Buzzer Available'}
            </Text>
          </View>

          <TouchableOpacity
              style={[
                styles.ackButton,
                buzzerStatus === 'available' && { opacity: 0.5 }
              ]}
              onPress={handleAcknowledge}
              disabled={buzzerStatus === 'available'}
            >
            <Text style={styles.ackText}>
              {buzzerStatus === 'ack' ? 'Done' : 'Acknowledge'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f0e3',
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
    paddingTop: 3,
  },

  content: {
    flex: 1,
    padding: 13,
    paddingBottom: 80
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },

  filter: {
    backgroundColor: '#EFE7DC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#4A3728',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },

  filterActive: {
    backgroundColor: '#4A3728',
    color: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3728',
    marginBottom: 10,
    marginTop: 10,
    letterSpacing: 0.5,
  },

  empty: {
    fontSize: 13,
    color: '#8A7A6C',
    marginBottom: 10,
  },

  buzzerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },  
  
  buzzerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#f8f0e3', 
  },

  buzzerStatus: {
    flex: 1,
    backgroundColor: '#FFF4E5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
  },

  ackButton: {
    flex: 1,
    backgroundColor: '#4A3728',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  buzzerText: {
    fontWeight: '600',
    color: '#4A3728',
},

  ackText: {
    color: '#FFFFFF',
    fontWeight: '600',
},
});