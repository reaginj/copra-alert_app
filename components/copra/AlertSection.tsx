import { StyleSheet, Text } from 'react-native';

import AlertItem from '@/components/copra/AlertItem';

type AlertSectionItem = {
  type: 'Delikado' | 'Babala' | 'Normal';
  title: string;
  message: string;
  temp: string;
  time: string;
};

type AlertSectionProps = {
  title: string;
  emptyText: string;
  alerts: AlertSectionItem[];
};

export default function AlertSection({ title, emptyText, alerts }: AlertSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>

      {alerts.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        alerts.map((alert, index) => (
          <AlertItem key={index} {...alert} />
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
