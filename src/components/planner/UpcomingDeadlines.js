import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext';

export default function UpcomingDeadlines({ tasks, selectedDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const selectedSecsEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59).getTime() / 1000;
  const upcoming = tasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds > selectedSecsEnd).sort((a,b) => a.dueDateSeconds - b.dueDateSeconds).slice(0, 4);
  const overdue = tasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds < selectedSecsEnd - 86400).sort((a,b) => a.dueDateSeconds - b.dueDateSeconds);
  if (upcoming.length === 0 && overdue.length === 0) return null;

  const getDayLabel = (secs) => { const d = new Date(secs * 1000); const now = new Date(); const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000); if (diffDays === 1) return 'Tomorrow'; if (diffDays === 2) return 'In 2 days'; return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); };

  return (
    <View style={styles.container}><Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
      {overdue.slice(0, 3).map(t => <View key={t.id} style={[styles.card, styles.overdueCard]}><Text style={styles.overdueLabel}>Overdue</Text><Text style={styles.taskName} numberOfLines={1}>{t.name}</Text></View>)}
      {upcoming.map(t => <View key={t.id} style={styles.card}><Text style={styles.dayLabel}>{getDayLabel(t.dueDateSeconds)}</Text><Text style={styles.taskName} numberOfLines={1}>{t.name}</Text></View>)}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 24, backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.l, padding: 16 },
  sectionTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  overdueCard: { borderColor: '#FF525255', borderWidth: 1, backgroundColor: 'rgba(255, 82, 82, 0.05)' },
  dayLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', width: 80 },
  overdueLabel: { color: '#FF5252', fontSize: 12, fontWeight: 'bold', width: 80 },
  taskName: { flex: 1, color: theme.colors.text, fontSize: 13 },
});
