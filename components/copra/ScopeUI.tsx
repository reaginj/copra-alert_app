import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { DeliveryStatus, DryingStatus } from './systemData';

export const palette = { green: '#246B45', greenDark: '#174B32', cream: '#F7F3E8', white: '#FFFFFF', brown: '#76543B', ink: '#26332C', muted: '#6D776F', line: '#E3E4DA', danger: '#A13D35', warning: '#A56A14', paleGreen: '#E7F1EA' };

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHead}><Text style={styles.sectionTitle}>{title}</Text>{action ? <TouchableOpacity onPress={onAction}><Text style={styles.action}>{action}</Text></TouchableOpacity> : null}</View>;
}

export function SectionHeading({ title }: { title: string }) {
  return <Text style={styles.sectionHeading}>{title}</Text>;
}

export function PageActionButton({ label, icon = 'add', onPress }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.pageAction} accessibilityRole="button" accessibilityLabel={label}><Ionicons name={icon} size={19} color={palette.white} /><Text style={styles.pageActionText}>{label}</Text></TouchableOpacity>;
}

export function FilterPills<T extends string>({ values, selected, onSelect }: { values: readonly T[]; selected: T; onSelect: (value: T) => void }) {
  return <View style={styles.filters}>{values.map((value) => <TouchableOpacity key={value} onPress={() => onSelect(value)} style={[styles.filter, selected === value && styles.filterActive]}><Text style={[styles.filterText, selected === value && styles.filterTextActive]}>{value}</Text></TouchableOpacity>)}</View>;
}

export function formatAppDate(value: string, includeTime = true) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  let date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return includeTime ? `${datePart} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : datePart;
}

export function StatusPill({ value, prominent = false, warehouse = false }: { value?: DryingStatus | DeliveryStatus; prominent?: boolean; warehouse?: boolean }) {
  if (!value) return <View style={[styles.pill, prominent && styles.pillProminent, warehouse && styles.pillWarehouse, styles.pillPending]}><View style={[styles.dot, prominent && styles.dotProminent, { backgroundColor: palette.muted }]} /><Text style={[styles.pillText, prominent && styles.pillTextProminent, warehouse && styles.pillTextWarehouse, { color: palette.muted }]}>UNAVAILABLE</Text></View>;
  const colors = value === 'GOOD' || value === 'Received' ? ['#DDF1E4', '#21663E'] : value === 'NOT GOOD' || value === 'Scheduled' || value === 'In Transit' ? ['#FFF0D5', '#8A5912'] : value === 'Cancelled' ? ['#ECEDE9', '#626960'] : ['#F8DDDA', '#9B332C'];
  return <View style={[styles.pill, prominent && styles.pillProminent, warehouse && styles.pillWarehouse, { backgroundColor: colors[0], borderColor: prominent ? colors[1] : 'transparent' }]}><View style={[styles.dot, prominent && styles.dotProminent, { backgroundColor: colors[1] }]} /><Text style={[styles.pillText, prominent && styles.pillTextProminent, warehouse && styles.pillTextWarehouse, { color: colors[1] }]}>{value}</Text></View>;
}

export function TemperatureDisplay({ value, size = 'dashboard' }: { value?: number; size?: 'dashboard' | 'monitoring' }) {
  return <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={[styles.temperature, size === 'monitoring' && styles.temperatureMonitoring]}>{value === undefined ? '—' : `${value.toFixed(1)}°C`}</Text>;
}

export function EmptyState({ icon = 'folder-open-outline', title, message }: { icon?: keyof typeof Ionicons.glyphMap; title: string; message: string }) {
  return <Card style={styles.empty}><Ionicons name={icon} size={30} color={palette.muted} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{message}</Text></Card>;
}

export function DataStateNotice({ loading, error }: { loading: boolean; error: string | null }) {
  if (!loading && !error) return null;
  return <View style={[styles.dataNotice, error && styles.dataNoticeError]}>{loading && !error ? <ActivityIndicator size="small" color={palette.green} /> : <Ionicons name="cloud-offline-outline" size={18} color={palette.danger} />}<Text style={[styles.dataNoticeText, error && { color: palette.danger }]}>{error || 'Loading records…'}</Text></View>;
}

export function MetricCard({ icon, label, value, helper, emphasis = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; helper?: string; emphasis?: boolean }) {
  return <Card style={[styles.metric, emphasis && styles.metricEmphasis]}><View style={styles.metricIcon}><Ionicons name={icon} size={19} color={palette.green} /></View><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={[styles.metricValue, emphasis && styles.metricValueEmphasis]}>{value}</Text>{helper ? <Text numberOfLines={1} style={styles.helper}>{helper}</Text> : null}</Card>;
}

export const commonStyles = StyleSheet.create({ screen: { flex: 1, backgroundColor: palette.cream }, content: { padding: 16, paddingBottom: 32, gap: 12 }, row: { flexDirection: 'row', gap: 10 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#D8DBD3', backgroundColor: palette.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: palette.ink, fontSize: 15 }, label: { color: palette.ink, fontSize: 13, fontWeight: '700', marginBottom: 6 }, primary: { minHeight: 50, backgroundColor: palette.green, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: palette.white, fontWeight: '800', fontSize: 15 }, muted: { color: palette.muted, lineHeight: 19 }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, paddingVertical: 5 }, detailLabel: { color: palette.muted, flex: 1, fontSize: 12 }, detailValue: { color: palette.ink, fontWeight: '700', flex: 1.4, textAlign: 'right', fontSize: 12, flexWrap: 'wrap' } });

const styles = StyleSheet.create({
  card: { backgroundColor: palette.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: palette.line, shadowColor: '#213126', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }, sectionTitle: { fontSize: 17, fontWeight: '800', color: palette.ink }, sectionHeading: { color: palette.ink, fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 }, action: { color: palette.green, fontWeight: '800', fontSize: 13 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }, dot: { width: 7, height: 7, borderRadius: 4 }, pillText: { fontSize: 11, fontWeight: '900' },
  pillProminent: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, pillWarehouse: { paddingHorizontal: 11, paddingVertical: 7 }, dotProminent: { width: 8, height: 8 }, pillTextProminent: { fontSize: 13, fontWeight: '800' }, pillTextWarehouse: { fontSize: 14, fontWeight: '700' },
  pillPending: { backgroundColor: '#ECEDE9', borderColor: '#A8ADA8' },
  temperature: { color: palette.greenDark, fontSize: 42, fontWeight: '700', letterSpacing: -1.2, lineHeight: 49 }, temperatureMonitoring: { fontSize: 47, lineHeight: 54 },
  empty: { alignItems: 'center', paddingVertical: 25 }, emptyTitle: { color: palette.ink, fontWeight: '800', marginTop: 8 }, emptyText: { color: palette.muted, textAlign: 'center', marginTop: 4, fontSize: 13 },
  metric: { flex: 1, minWidth: '46%', padding: 12 }, metricIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, metricLabel: { fontSize: 11, color: palette.muted, fontWeight: '700' }, metricValue: { fontSize: 18, color: palette.ink, fontWeight: '900', marginTop: 3, flexShrink: 1 }, helper: { color: palette.muted, fontSize: 10, marginTop: 3 },
  metricEmphasis: { borderColor: '#BCD6C4', backgroundColor: '#FBFDFB' }, metricValueEmphasis: { color: palette.greenDark, fontSize: 21 },
  pageAction: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: palette.green, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11, shadowColor: palette.greenDark, shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  pageActionText: { color: palette.white, fontSize: 14, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line }, filterActive: { backgroundColor: palette.green, borderColor: palette.green }, filterText: { color: palette.muted, fontSize: 12, fontWeight: '800' }, filterTextActive: { color: palette.white },
  dataNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: palette.paleGreen, borderWidth: 1, borderColor: '#C9DCCF' }, dataNoticeError: { backgroundColor: '#FBEAE8', borderColor: '#E8C1BD' }, dataNoticeText: { flex: 1, color: palette.greenDark, fontSize: 12, fontWeight: '600' },
});
