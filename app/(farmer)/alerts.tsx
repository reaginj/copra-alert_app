import { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AlertFilterBar from '@/components/copra/AlertFilterBar';
import AlertSection from '@/components/copra/AlertSection';
import BuzzerControlBar from '@/components/copra/BuzzerControlBar';
import Header from '@/components/copra/Header';

type AlertType = 'Delikado' | 'Babala' | 'Normal';
type FilterType = 'All' | 'Babala' | 'Delikado';
type BuzzerStatus = 'active' | 'ack' | 'available';

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
      temp: '85Â°C',
      time: '2 mins ago',
      status: 'recent',
    },
    {
      type: 'Babala',
      title: 'Tumataas ang Init',
      message: 'Bantayan ang pugon',
      temp: '58Â°C',
      time: '5 mins ago',
      status: 'active',
    },
    {
      type: 'Normal',
      title: 'Normal Temperature',
      message: 'Bumalik na sa normal ang init',
      temp: '46Â°C',
      time: '20 mins ago',
      status: 'recent',
    },
    {
      type: 'Babala',
      title: 'Temperature Rising',
      message: 'Unti-unting tumataas ang init',
      temp: '75Â°C',
      time: '5 mins ago',
      status: 'active',
    },
    {
      type: 'Babala',
      title: 'Unstable Heat',
      message: 'Hindi pantay ang init sa drying area',
      temp: '70Â°C',
      time: '25 mins ago',
      status: 'recent',
    },
    {
      type: 'Delikado',
      title: 'Overheating Detected',
      message: 'Sobrang taas ng init, posibleng masunog ang copra',
      temp: '92Â°C',
      time: '2 mins ago',
      status: 'recent',
    },
    {
      type: 'Delikado',
      title: 'Burn Risk',
      message: 'Patuloy ang pagtaas ng temperatura',
      temp: '88Â°C',
      time: '10 mins ago',
      status: 'active',
    },
  ];

  const hasCritical = alerts.some(
    (alert) => alert.type === 'Delikado' && alert.status === 'active'
  );

  let buzzerStatus: BuzzerStatus;

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

  const activeAlerts = filteredAlerts
    .filter((alert) => alert.status === 'active')
    .slice(0, 3);

  const recentAlerts = filteredAlerts
    .filter((alert) => alert.status === 'recent')
    .slice(0, 2);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Alerts"
          subtitle="Live updates and warnings"
          profileRoute="/(farmer)/profile"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AlertFilterBar
          filters={['All', 'Babala', 'Delikado']}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        <AlertSection
          title="ACTIVE ALERTS"
          emptyText="No active alerts"
          alerts={activeAlerts}
        />

        <AlertSection
          title="RECENT ALERTS"
          emptyText="No recent alerts"
          alerts={recentAlerts}
        />
      </ScrollView>

      <BuzzerControlBar
        buzzerStatus={buzzerStatus}
        onAcknowledge={handleAcknowledge}
      />
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

  content: {
    flex: 1,
    padding: 13,
    paddingBottom: 80,
  },
});
