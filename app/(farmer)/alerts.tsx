import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/copra/Header';
import { Card, commonStyles, DataStateNotice, EmptyState, FilterPills, palette, SectionHeading } from '@/components/copra/ScopeUI';
import { useSystemData } from '@/components/copra/systemData';

const filters = ['All', 'Unread', 'Read'] as const;
type AlertFilter = typeof filters[number];

export default function Alerts() {
  const { alerts, markAlertRead, loading, error } = useSystemData();
  const [filter, setFilter] = useState<AlertFilter>('All');
  const unreadCount = alerts.filter((item) => !item.read).length;
  const visibleAlerts = useMemo(() => [...alerts].filter((item) => filter === 'All' || (filter === 'Unread' ? !item.read : item.read)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [alerts, filter]);

  const openAlert = async (id: string, batchId: string) => {
    try {
      await markAlertRead(id);
      router.push({ pathname: '/(farmer)/monitor', params: { batchId } } as never);
    } catch (cause) {
      Alert.alert('Unable to update alert', cause instanceof Error ? cause.message : 'Please try again.');
    }
  };

  return <View style={commonStyles.screen}>
    <SafeAreaView edges={['top']} style={styles.safe}><Header title="Drying Alerts" subtitle="Conditions requiring attention" profileRoute="/(farmer)/profile" /></SafeAreaView>
    <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
      <DataStateNotice loading={loading} error={error} />
      <View style={styles.summary}><SectionHeading title="Notifications" /><View style={styles.summaryActions}>{unreadCount ? <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unreadCount}</Text></View> : null}</View></View>
      <FilterPills values={filters} selected={filter} onSelect={setFilter} />
      {visibleAlerts.length ? visibleAlerts.map((item) => <TouchableOpacity key={item.id} activeOpacity={0.76} onPress={() => openAlert(item.id, item.batchId)}>
        <Card style={[styles.card, !item.read && styles.unreadCard]}><View style={styles.row}><View style={[styles.icon, item.read && styles.iconRead]}><Ionicons name="warning-outline" size={18} color={item.read ? palette.muted : palette.warning} /></View><View style={{ flex: 1 }}><View style={styles.titleRow}><Text numberOfLines={2} style={[styles.title, item.read && styles.readTitle]}>{item.title}</Text>{!item.read ? <View style={styles.newDot} /> : null}</View><Text style={styles.batch}>{item.batchDisplayCode}</Text><Text numberOfLines={2} style={styles.description}>{item.description}</Text><View style={styles.footer}><Text style={styles.time}>{item.createdAt}</Text><Text style={styles.openText}>{item.read ? 'View batch' : 'Open & mark read'}</Text></View></View><Ionicons name="chevron-forward" size={17} color={palette.muted} /></View></Card>
      </TouchableOpacity>) : <EmptyState icon="notifications-off-outline" title={!alerts.length ? 'No drying alerts yet' : filter === 'Unread' ? 'No unread alerts' : 'No matching alerts'} message={!alerts.length ? 'Drying alerts will appear here after actual monitoring records are available.' : 'No notifications match this filter.'} />}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.greenDark }, summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, summaryActions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, heading: { color: palette.ink, fontSize: 20, fontWeight: '900' }, subheading: { color: palette.muted, fontSize: 12, marginTop: 3 }, unreadBadge: { minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.warning }, unreadBadgeText: { color: palette.white, fontSize: 12, fontWeight: '900' }, card: { padding: 12 }, unreadCard: { borderLeftWidth: 3, borderLeftColor: palette.warning, backgroundColor: '#FFFEFB' }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF0D5', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, iconRead: { backgroundColor: '#F0F1EE' }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 }, title: { flex: 1, fontWeight: '900', color: palette.ink, fontSize: 13, lineHeight: 18 }, readTitle: { color: '#59625C' }, newDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.warning, marginTop: 5 }, batch: { color: palette.green, fontWeight: '800', fontSize: 10, marginTop: 2 }, description: { color: palette.muted, lineHeight: 17, fontSize: 12, marginTop: 5 }, footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 7 }, time: { color: palette.muted, fontSize: 9, flex: 1 }, openText: { color: palette.green, fontSize: 9, fontWeight: '800' },
});
