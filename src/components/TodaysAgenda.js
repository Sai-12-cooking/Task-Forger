import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';
import TaskItem from './TaskItem';
import { TC_DAILY } from '../constants';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function TodaysAgenda({ tasks, habits, logs, onComplete, onDelete, onEdit, onToggleHabit, selectedDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dateObj = selectedDate instanceof Date ? selectedDate : new Date();
  const targetStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0).getTime() / 1000;
  const targetEnd = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59).getTime() / 1000;

  const dateTasks = tasks.filter(t => !t.completed && t.taskCategory !== TC_DAILY && t.dueDateSeconds >= targetStart && t.dueDateSeconds <= targetEnd).sort((a, b) => a.dueDateSeconds - b.dueDateSeconds);
  const dailyTasks = tasks.filter(t => !t.completed && t.taskCategory === TC_DAILY).sort((a, b) => a.dueDateSeconds - b.dueDateSeconds);

  const todayDateObj = new Date();
  const isToday = dateObj.getFullYear() === todayDateObj.getFullYear() && dateObj.getMonth() === todayDateObj.getMonth() && dateObj.getDate() === todayDateObj.getDate();
  const selectedDateStr = dateObj.toISOString().split('T')[0];
  const activeHabits = !isToday ? [] : (habits || []).filter(h => { if (!h.active) return false; if (h.frequency === 'weekdays') { const day = dateObj.getDay(); return day !== 0 && day !== 6; } return true; });
  const hasAnything = dateTasks.length > 0 || dailyTasks.length > 0 || activeHabits.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agenda for {MONTHS[dateObj.getMonth()]} {dateObj.getDate()}</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasAnything && <Text style={styles.empty}>Your agenda is clear! 🎉</Text>}
        {dateTasks.map(task => <TaskItem key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />)}
        {dailyTasks.length > 0 && (
          <>
            <View style={styles.dividerRow}><View style={styles.dividerLine} /><Text style={styles.dividerLabel}>🛒 Daily Recurring</Text><View style={styles.dividerLine} /></View>
            {dailyTasks.map(task => <TaskItem key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />)}
          </>
        )}
        {activeHabits.length > 0 && (
          <>
            <View style={styles.dividerRow}><View style={styles.dividerLine} /><Text style={[styles.dividerLabel, { color: theme.colors.primary }]}>🔥 Habits</Text><View style={styles.dividerLine} /></View>
            {activeHabits.map(habit => {
              const log = (logs || []).find(l => l.habitId === habit.id && l.date === selectedDateStr);
              const isCompleted = log && log.completed;
              return (
                <TouchableOpacity key={habit.id} style={[styles.habitItem, isCompleted && styles.habitItemCompleted]} onPress={() => onToggleHabit(habit)} activeOpacity={0.7}>
                  <Text style={styles.habitItemIcon}>{habit.icon}</Text>
                  <Text style={[styles.habitItemName, isCompleted && styles.habitItemNameCompleted]}>{habit.name}</Text>
                  <View style={[styles.habitCheck, isCompleted && styles.habitCheckCompleted]}>{isCompleted && <Text style={styles.habitCheckText}>✓</Text>}</View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.l, padding: theme.spacing.m },
  header: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: theme.spacing.m },
  empty: { color: theme.colors.textSecondary, fontStyle: 'italic' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 6 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#FF9F4340' },
  dividerLabel: { color: '#FF9F43', fontSize: 11, fontWeight: '700' },
  habitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  habitItemCompleted: { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' },
  habitItemIcon: { fontSize: 16, marginRight: 10 },
  habitItemName: { flex: 1, color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  habitItemNameCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
  habitCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  habitCheckCompleted: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  habitCheckText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
});
