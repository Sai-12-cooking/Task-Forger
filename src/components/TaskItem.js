import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../ThemeContext';
import {
  Q_URGENT_IMPORTANT, Q_NOT_URGENT_IMPORTANT,
  Q_URGENT_NOT_IMPORTANT, Q_NOT_URGENT_NOT_IMPORTANT,
  TASK_CATEGORY_MAP, TC_OTHERS,
} from '../constants';

const QUADRANTS = [
  { id: Q_URGENT_IMPORTANT, label: 'Imp & Urgent', color: '#FF5252' },
  { id: Q_NOT_URGENT_IMPORTANT, label: 'Imp & Not Urgent', color: '#FF4081' },
  { id: Q_URGENT_NOT_IMPORTANT, label: 'Not Imp & Urgent', color: '#FFB142' },
  { id: Q_NOT_URGENT_NOT_IMPORTANT, label: 'Not Imp & Not Urg', color: '#7C4DFF' },
];

const getQuadrantColor = (categoryId) =>
  QUADRANTS.find(q => q.id === categoryId)?.color ?? '#333';

const RECUR_ICONS = { daily: '🔁', weekly: '📆', weekdays: '🗓', monthly: '🗃', none: null };

export default function TaskItem({ task, onComplete, onDelete, onEdit, onMove }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showMover, setShowMover] = useState(false);
  const isOverdue = task.dueDateSeconds ? Math.floor(Date.now() / 1000) > task.dueDateSeconds : false;

  const getDueText = () => {
    if (!task.dueDateSeconds) return 'No due date';
    const date = new Date(task.dueDateSeconds * 1000);
    const distance = formatDistanceToNow(date, { addSuffix: true });
    return isOverdue ? `Overdue (${distance})` : `Due ${distance}`;
  };

  const catObj = TASK_CATEGORY_MAP[task.taskCategory ?? TC_OTHERS] ?? TASK_CATEGORY_MAP[TC_OTHERS];
  const recurIcon = RECUR_ICONS[task.recurringType] ?? null;

  return (
    <View>
      <TouchableOpacity activeOpacity={0.82}
        style={[styles.container, task.completed && styles.completedContainer, isOverdue && !task.completed && styles.overdueContainer]}>
        <View style={[styles.stripe, { backgroundColor: getQuadrantColor(task.category) }]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={2}>{task.name}</Text>
              {recurIcon && <Text style={styles.recurIcon}>{recurIcon}</Text>}
            </View>
            <View style={styles.actions}>
              {!task.completed && (
                <>
                  <TouchableOpacity onPress={() => setShowMover(v => !v)} style={styles.actionBtn} hitSlop={{top:6,bottom:6,left:6,right:6}}>
                    <Text style={styles.moveBtnText}>⬆</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionBtn} hitSlop={{top:6,bottom:6,left:6,right:6}}>
                    <Text style={[styles.editBtnText, { color: theme.colors.primary }]}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onComplete(task.id)} style={styles.actionBtn} hitSlop={{top:6,bottom:6,left:6,right:6}}>
                    <Text style={styles.completeBtnText}>✓</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.actionBtn} hitSlop={{top:6,bottom:6,left:6,right:6}}>
                <Text style={[styles.deleteBtnText, { color: theme.colors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={[styles.badge, { backgroundColor: catObj.color + '25', borderColor: catObj.color + '60' }]}>
              <Text style={[styles.badgeText, { color: catObj.color }]}>{catObj.emoji} {catObj.label}</Text>
            </View>
            <Text style={[styles.dueText, isOverdue && !task.completed && styles.overdueText]}>{getDueText()}</Text>
          </View>
          {task.shifted && <Text style={[styles.shiftedText, { color: theme.colors.secondary }]}>⚡ Shifted to Urgent!</Text>}
        </View>
      </TouchableOpacity>
      {showMover && (
        <View style={styles.moverPanel}>
          <Text style={styles.moverTitle}>Move to:</Text>
          <View style={styles.moverGrid}>
            {QUADRANTS.filter(q => q.id !== task.category).map(q => (
              <TouchableOpacity key={q.id} style={[styles.moverBtn, { borderColor: q.color }]}
                onPress={() => { onMove(task.id, q.id); setShowMover(false); }}>
                <View style={[styles.moverDot, { backgroundColor: q.color }]} />
                <Text style={[styles.moverLabel, { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.m, marginBottom: theme.spacing.s, flexDirection: 'row', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  completedContainer: { opacity: 0.45 },
  overdueContainer: { shadowColor: '#FF5252', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 },
  stripe: { width: 4, alignSelf: 'stretch' },
  body: { flex: 1, padding: theme.spacing.m, paddingLeft: 10 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 6 },
  title: { color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  recurIcon: { fontSize: 11 },
  completedText: { textDecorationLine: 'line-through', color: theme.colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionBtn: { padding: 4 },
  moveBtnText: { color: '#FFB142', fontSize: 14 },
  completeBtnText: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
  editBtnText: { fontSize: 14 },
  deleteBtnText: { fontSize: 14, fontWeight: 'bold' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  dueText: { color: theme.colors.textSecondary, fontSize: 10 },
  overdueText: { color: theme.colors.error, fontWeight: 'bold' },
  shiftedText: { fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  moverPanel: { backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.m, padding: 10, marginBottom: theme.spacing.s, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, marginTop: -6 },
  moverTitle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  moverGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moverBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9, backgroundColor: theme.colors.surface },
  moverDot: { width: 6, height: 6, borderRadius: 3 },
  moverLabel: { fontSize: 11, fontWeight: '600' },
});
