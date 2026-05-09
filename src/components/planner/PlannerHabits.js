import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../ThemeContext';

export default function PlannerHabits({ habits, logs, onToggleHabit, selectedDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!habits || habits.length === 0) return null;
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  return (
    <View style={styles.container}><Text style={styles.sectionTitle}>Daily Habits</Text>
      <View style={styles.habitsGrid}>
        {habits.map(habit => {
          const log = (logs || []).find(l => l.habitId === habit.id && l.date === selectedDateStr);
          const isCompleted = log && log.completed;
          return (
            <TouchableOpacity key={habit.id} style={[styles.habitItem, isCompleted && styles.habitItemCompleted]} onPress={() => onToggleHabit(habit)} activeOpacity={0.7}>
              <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>{isCompleted && <Text style={styles.checkText}>✓</Text>}</View>
              <Text style={styles.habitItemIcon}>{habit.icon}</Text>
              <Text style={[styles.habitItemName, isCompleted && styles.habitItemNameCompleted]} numberOfLines={1}>{habit.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 24, backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.l, padding: 16 },
  sectionTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  habitsGrid: { gap: 8 },
  habitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  habitItemCompleted: { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' },
  checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#555', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  habitItemIcon: { fontSize: 14, marginRight: 8 },
  habitItemName: { flex: 1, color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  habitItemNameCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
});
