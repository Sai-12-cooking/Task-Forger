import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';
import { saveHabits } from '../utils/storage';
import { TASK_CATEGORIES, TASK_CATEGORY_MAP } from '../constants';
import AddHabitModal from './AddHabitModal';
import SmartNudge from './SmartNudge';

export default function HabitsView({ habits, setHabits, logs, onToggleHabit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDay = new Date().getDay();

  const activeHabits = habits.filter(h => {
    if (!h.active) return false;
    if (h.frequency === 'weekdays') return todayDay !== 0 && todayDay !== 6;
    return true;
  });

  const grouped = {};
  activeHabits.forEach(h => {
    const key = h.category || 'others';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });

  const handleAddOrEdit = (habit) => {
    const existing = habits.findIndex(h => h.id === habit.id);
    let next;
    if (existing >= 0) { next = [...habits]; next[existing] = habit; }
    else { next = [...habits, habit]; }
    setHabits(next); saveHabits(next);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🔥 Habit Engine</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingHabit(null); setShowModal(true); }} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ New Habit</Text>
        </TouchableOpacity>
      </View>

      <SmartNudge habits={habits} logs={logs} />

      {Object.entries(grouped).map(([catId, catHabits]) => {
        const catObj = TASK_CATEGORY_MAP[catId] || {};
        return (
          <View key={catId} style={styles.categoryBlock}>
            <Text style={[styles.catLabel, { color: catObj.color || theme.colors.textSecondary }]}>{catObj.emoji || '✨'} {catObj.label || 'Other'}</Text>
            {catHabits.map(habit => {
              const log = logs.find(l => l.habitId === habit.id && l.date === todayStr);
              const done = log && log.completed;
              return (
                <TouchableOpacity key={habit.id} style={[styles.habitCard, done && styles.habitCardDone]}
                  onPress={() => onToggleHabit(habit)} onLongPress={() => { setEditingHabit(habit); setShowModal(true); }} activeOpacity={0.7}>
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={styles.checkText}>✓</Text>}
                  </View>
                  <Text style={styles.habitIcon}>{habit.icon}</Text>
                  <Text style={[styles.habitName, done && styles.habitNameDone]} numberOfLines={1}>{habit.name}</Text>
                  <Text style={styles.freqBadge}>{habit.frequency}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {activeHabits.length === 0 && <Text style={styles.emptyText}>No active habits for today. Tap + to add one!</Text>}

      <AddHabitModal visible={showModal} onClose={() => setShowModal(false)} onAdd={handleAddOrEdit} initialHabit={editingHabit} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { color: theme.colors.text, fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  categoryBlock: { marginBottom: 20 },
  catLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  habitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  habitCardDone: { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  habitIcon: { fontSize: 18, marginRight: 10 },
  habitName: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  habitNameDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  freqBadge: { color: theme.colors.textSecondary, fontSize: 10, backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  emptyText: { color: theme.colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
});
