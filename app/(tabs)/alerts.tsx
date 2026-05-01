import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlertItem from '@/components/copra/AlertItem';

type AlertType = 'Delikado' | 'Babala' | 'Normal';
type FilterType = 'Lahat' | 'Babala' | 'Delikado';

type AlertData = {
  type: AlertType;
  title: string;
  message: string;
  temp: string;
  time: string;
  status: 'active' | 'recent';
};

export default function Alerts() {
  const [filter, setFilter] = useState<FilterType>('Lahat');

  const alerts: AlertData[] = [
    {
      type: 'Delikado',
      title: 'Sobrang Init',
      message: 'Pahinaan ang apoy',
      temp: '85°C',
      time: '2 mins ago',
      status: 'active',
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
      title: 'Temperatura Normal',
      message: 'Bumalik na sa normal ang init',
      temp: '46°C',
      time: '20 mins ago',
      status: 'recent',
    },
  ];

  const filteredAlerts =
    filter === 'Lahat'
      ? alerts
      : alerts.filter((alert) => alert.type === filter);

  const activeAlerts = filteredAlerts.filter(
    (alert) => alert.status === 'active'
  );

  const recentAlerts = filteredAlerts.filter(
    (alert) => alert.status === 'recent'
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>Live updates and warnings</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {(['Lahat', 'Babala', 'Delikado'] as FilterType[]).map((item) => (
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
});