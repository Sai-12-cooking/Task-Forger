import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function HabitStatsGrid({ habits = [], logs = [] }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { totalStreak, highestHabit, completionRate } = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    let totalStreak = 0;
    for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(today.getDate() - i); const dayStr = d.toISOString().split('T')[0]; const loggedAny = logs.some(l => l.date === dayStr && l.completed); if (loggedAny) totalStreak++; else if (i > 0) break; }
    const counts = {}; logs.forEach(l => { if(l.completed) counts[l.habitId] = (counts[l.habitId] || 0) + 1; });
    let bestId = null; let max = 0; Object.keys(counts).forEach(id => { if(counts[id] > max) { max = counts[id]; bestId = id; } });
    const highestHabit = habits.find(h => h.id === bestId);
    let possible = 0; let done = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() - i); const dayStr = d.toISOString().split('T')[0]; const dayOfWeek = d.getDay();
      habits.forEach(h => { if(!h.active) return; let shouldDo = true; if(h.frequency === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldDo = false; if(shouldDo) possible++; if(logs.find(l => l.habitId === h.id && l.date === dayStr && l.completed)) done++; }); }
    const completionRate = possible > 0 ? Math.round((done / possible) * 100) : 0;
    return { totalStreak, highestHabit, completionRate };
  }, [habits, logs]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habits Engine</Text>
      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#FF9F43' }]}><Text style={styles.emoji}>🔥</Text><Text style={[styles.value, {color: '#FF9F43'}]}>{totalStreak} Days</Text><Text style={styles.label}>Global Streak</Text></View>
        <View style={[styles.card, { borderLeftColor: theme.colors.secondary }]}><Text style={styles.emoji}>📈</Text><Text style={[styles.value, {color: theme.colors.secondary}]}>{completionRate}%</Text><Text style={styles.label}>Weekly Consistency</Text></View>
        <View style={[styles.card, { borderLeftColor: theme.colors.primary }]}><Text style={styles.emoji}>🏆</Text><Text style={[styles.value, {color: theme.colors.primary, fontSize: 16}]} numberOfLines={1}>{highestHabit ? `${highestHabit.icon} ${highestHabit.name}` : 'None yet'}</Text><Text style={styles.label}>MVP Habit</Text></View>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginTop: 8 },
  sectionTitle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  grid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  card: { flex: 1, backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, borderLeftWidth: 3, padding: 10 },
  emoji: { fontSize: 16, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, fontWeight: '500' },
});
