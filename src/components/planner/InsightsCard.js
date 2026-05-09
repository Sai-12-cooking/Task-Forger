import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext';

export default function InsightsCard({ tasks, selectedDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tomorrow = new Date(selectedDate); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0,0,0).getTime()/1000;
  const tomEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23,59,59).getTime()/1000;
  const tomorrowTasks = tasks.filter(t => !t.completed && t.dueDateSeconds >= tomStart && t.dueDateSeconds <= tomEnd);
  const selectedSecsEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59).getTime() / 1000;
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds < selectedSecsEnd - 86400);

  let insightMessage = "You're all structured for what's ahead. Great planning!"; let icon = "✨";
  if (overdueTasks.length > 0) { insightMessage = `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} need attention. Consider rescheduling them.`; icon = "⚠️"; }
  else if (tomorrowTasks.length >= 5) { const nextDay = new Date(tomorrow); nextDay.setDate(nextDay.getDate() + 1); insightMessage = `You have ${tomorrowTasks.length} tasks tomorrow. Consider moving one to ${nextDay.toLocaleDateString([], { weekday: 'long' })}.`; icon = "💡"; }
  else { const todEnd = selectedSecsEnd; const todStart = todEnd - 86400; const todayTasks = tasks.filter(t => !t.completed && t.dueDateSeconds > todStart && t.dueDateSeconds < todEnd); if (todayTasks.length > 0 && todayTasks.length <= 3) { insightMessage = "Your schedule has some open blocks today. Great time for deep focus or an impromptu workout."; icon = "🧘"; } }

  return (
    <View style={styles.container}><Text style={styles.icon}>{icon}</Text>
      <View style={styles.textWrap}><Text style={styles.title}>Productivity Insight</Text><Text style={styles.body}>{insightMessage}</Text></View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 24, backgroundColor: theme.colors.primary + '18', borderRadius: theme.radii.l, padding: 16, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: theme.colors.primary + '30' },
  icon: { fontSize: 24, marginRight: 12 },
  textWrap: { flex: 1 },
  title: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  body: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
