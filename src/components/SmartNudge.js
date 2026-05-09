import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function SmartNudge({ habits = [], logs = [] }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const nudgeMessage = useMemo(() => {
    const today = new Date(); const todayStr = today.toISOString().split('T')[0]; const todayDayOfWeek = today.getDay();
    for (const habit of habits) {
      if (!habit.active) continue;
      let shouldDo = true;
      if (habit.frequency === 'weekdays' && (todayDayOfWeek === 0 || todayDayOfWeek === 6)) shouldDo = false;
      if (!shouldDo) continue;
      const doneToday = logs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed);
      if (doneToday) continue;
      let currentStreak = 0;
      for (let i = 1; i <= 30; i++) { const d = new Date(today); d.setDate(d.getDate() - i); const dayStr = d.toISOString().split('T')[0]; const logged = logs.some(l => l.habitId === habit.id && l.date === dayStr && l.completed); if (logged) currentStreak++; else break; }
      if (currentStreak >= 3) return `🔥 Your ${habit.name} streak (${currentStreak}d) is at risk today. Keep it going!`;
    }
    return null;
  }, [habits, logs]);

  if (!nudgeMessage) return null;
  return <View style={styles.container}><Text style={styles.text}>{nudgeMessage}</Text></View>;
}

const createStyles = (theme) => StyleSheet.create({
  container: { backgroundColor: theme.colors.primary + '25', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: theme.colors.primary, marginBottom: 12 },
  text: { color: theme.colors.primary, fontWeight: '600', fontSize: 12 },
});
