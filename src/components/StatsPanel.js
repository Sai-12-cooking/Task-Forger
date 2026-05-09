import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { TASK_CATEGORIES, TC_OTHERS, TASK_CATEGORY_MAP } from '../constants';
import HabitStatsGrid from './HabitStatsGrid';
import SmartNudge from './SmartNudge';

function getTaskCompletionDay(t) {
  if (!t.completed) return null;
  const sec = t.completedAt || t.dueDateSeconds;
  if (!sec) return null;
  const d = new Date(sec * 1000); d.setHours(0,0,0,0);
  return d.getTime();
}

function getWeeklyBars(tasks) {
  const bars = []; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const dayTarget = d.getTime(); const count = tasks.filter(t => getTaskCompletionDay(t) === dayTarget).length; bars.push({ day: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], count, isToday: i === 0 }); }
  return bars;
}

function getHeatmap(tasks) {
  const dots = []; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const count = tasks.filter(t => getTaskCompletionDay(t) === d.getTime()).length; dots.push({ date: d, count }); }
  return dots;
}

function getWeekStats(tasks) {
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); weekStart.setHours(0,0,0,0);
  const weekStartMs = weekStart.getTime(); let thisWeekDone = 0; let urgentCompletions = 0;
  tasks.forEach(t => { const day = getTaskCompletionDay(t); if (day && day >= weekStartMs) { thisWeekDone++; if (t.category === 'ur_im') urgentCompletions++; } });
  const urgent = tasks.filter(t => !t.completed && t.category === 'ur_im').length;
  const planned = tasks.filter(t => !t.completed && t.category !== 'ur_im').length;
  let streak = 0; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(today.getDate() - i); const done = tasks.some(t => getTaskCompletionDay(t) === d.getTime()); if (done) streak++; else if (i > 0) break; }
  const focusScore = thisWeekDone === 0 ? 0 : Math.round((urgentCompletions / thisWeekDone) * 100);
  return { thisWeekDone, urgent, planned, streak, focusScore };
}

export default function StatsPanel({ tasks, habits = [], logs = [] }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const now = Math.floor(Date.now() / 1000);
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const completedToday = tasks.filter(t => { const day = getTaskCompletionDay(t); return day && day === todayStart.getTime(); }).length;
  const pending = tasks.filter(t => !t.completed).length;
  const catCounts = {}; TASK_CATEGORIES.forEach(c => { catCounts[c.id] = 0; }); tasks.filter(t => t.taskCategory).forEach(t => { catCounts[t.taskCategory] = (catCounts[t.taskCategory] ?? 0) + 1; });
  const topCatId = Object.entries(catCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  const topCat = TASK_CATEGORY_MAP[topCatId] ?? TASK_CATEGORY_MAP[TC_OTHERS];

  const heatmap = useMemo(() => getHeatmap(tasks), [tasks]);
  const bars = useMemo(() => getWeeklyBars(tasks), [tasks]);
  const maxBar = Math.max(...bars.map(b => b.count), 1);
  const { thisWeekDone, urgent, planned, streak, focusScore } = useMemo(() => getWeekStats(tasks), [tasks]);
  const totalActive = Math.max(urgent + planned, 1);

  const statCards = [
    { label: 'Done Today', value: completedToday, color: '#4CAF50', emoji: '✅' },
    { label: 'Pending', value: pending, color: theme.colors.primary, emoji: '📋' },
    { label: 'Focus Score', value: `${focusScore}`, color: '#FFB142', emoji: '🎯' },
    { label: 'Top Area', value: `${topCat.emoji} ${topCat.label}`, color: topCat.color, emoji: '🏆', isText: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {streak >= 2 && <View style={styles.streakBanner}><Text style={styles.streakText}>🔥 {streak}-day task streak — You're on fire!</Text></View>}
      <SmartNudge habits={habits} logs={logs} />
      <HabitStatsGrid habits={habits} logs={logs} />
      <Text style={styles.sectionTitle}>Task Overview</Text>
      <View style={styles.statsGrid}>
        {statCards.map(s => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}><Text style={styles.statEmoji}>{s.emoji}</Text><Text style={[styles.statValue, { color: s.color }, s.isText && styles.statValueSmall]}>{s.value}</Text><Text style={styles.statLabel}>{s.label}</Text></View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Last 7 Days</Text>
      <View style={styles.chartContainer}>
        {bars.map((b, i) => (
          <View key={i} style={styles.barCol}><Text style={styles.barCount}>{b.count || ''}</Text>
            <View style={styles.barTrack}><View style={[styles.barFill, { height: `${Math.round((b.count / maxBar) * 100)}%`, backgroundColor: b.isToday ? theme.colors.primary : (b.count > 0 ? theme.colors.primary + '80' : '#333') }]} /></View>
            <Text style={[styles.barDay, b.isToday && { color: theme.colors.primary, fontWeight: '800' }]}>{b.day}</Text></View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.weekRow}>
        <View style={[styles.weekCard, { borderLeftColor: '#4CAF50' }]}><Text style={[styles.weekVal, { color: '#4CAF50' }]}>{thisWeekDone}</Text><Text style={styles.weekLabel}>Completed</Text></View>
        <View style={[styles.weekCard, { borderLeftColor: '#FF5252' }]}><Text style={[styles.weekVal, { color: '#FF5252' }]}>{urgent}</Text><Text style={styles.weekLabel}>Urgent</Text></View>
        <View style={[styles.weekCard, { borderLeftColor: theme.colors.secondary }]}><Text style={[styles.weekVal, { color: theme.colors.secondary }]}>{planned}</Text><Text style={styles.weekLabel}>Planned</Text></View>
      </View>
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>30-Day Consistency</Text>
      <View style={styles.heatmapContainer}>
        {heatmap.map((dot, i) => { let bg = '#2A2A35'; if (dot.count === 1) bg = theme.colors.primary + '60'; else if (dot.count === 2) bg = theme.colors.primary + '90'; else if (dot.count > 2) bg = theme.colors.primary; return <View key={i} style={[styles.heatmapDot, { backgroundColor: bg }]} />; })}
      </View>
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Priority Balance</Text>
      <View style={styles.ratioBar}><View style={[styles.ratioSegUrgent, { flex: urgent }]} /><View style={[styles.ratioSegPlanned, { flex: planned, backgroundColor: theme.colors.secondary }]} /></View>
      <View style={styles.ratioLegend}>
        <Text style={styles.ratioLegendText}><Text style={{ color: '#FF5252' }}>■ </Text>Urgent {Math.round(urgent/totalActive*100)}%</Text>
        <Text style={styles.ratioLegendText}><Text style={{ color: theme.colors.secondary }}>■ </Text>Planned {Math.round(planned/totalActive*100)}%</Text>
      </View>
      <Text style={styles.sectionTitle}>By Category</Text>
      {TASK_CATEGORIES.map(cat => { const count = catCounts[cat.id] ?? 0; const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
        return (<View key={cat.id} style={styles.catRow}><Text style={styles.catLabel}>{cat.emoji} {cat.label}</Text><View style={styles.catBarTrack}><View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} /></View><Text style={[styles.catCount, { color: cat.color }]}>{count}</Text></View>);
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  streakBanner: { backgroundColor: 'rgba(255,159,67,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,159,67,0.4)', marginBottom: 4 },
  streakText: { color: '#FFB142', fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, padding: 10, borderLeftWidth: 3, gap: 2 },
  statEmoji: { fontSize: 16 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  statValueSmall: { fontSize: 12 },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, padding: 10, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 3 },
  barCount: { color: theme.colors.textSecondary, fontSize: 9 },
  barTrack: { flex: 1, width: '70%', backgroundColor: '#2A2A35', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay: { color: theme.colors.textSecondary, fontSize: 9, fontWeight: '600' },
  heatmapContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, backgroundColor: theme.colors.surfaceHighlight, padding: 12, borderRadius: 10 },
  heatmapDot: { width: 14, height: 14, borderRadius: 3 },
  weekRow: { flexDirection: 'row', gap: 8 },
  weekCard: { flex: 1, backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, borderLeftWidth: 3, padding: 10, alignItems: 'center' },
  weekVal: { fontSize: 20, fontWeight: 'bold' },
  weekLabel: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 2 },
  ratioBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#333', marginBottom: 6 },
  ratioSegUrgent: { backgroundColor: '#FF5252' },
  ratioSegPlanned: {},
  ratioLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  ratioLegendText: { color: theme.colors.textSecondary, fontSize: 11 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catLabel: { color: theme.colors.text, fontSize: 11, width: 80 },
  catBarTrack: { flex: 1, height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3, minWidth: 4 },
  catCount: { fontSize: 11, fontWeight: '700', width: 20, textAlign: 'right' },
});
