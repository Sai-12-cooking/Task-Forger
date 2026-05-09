import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import TaskItem from './TaskItem';
import {
  CATEGORY_LABELS, TASK_CATEGORY_MAP, TC_ALL,
  Q_URGENT_IMPORTANT, Q_NOT_URGENT_IMPORTANT,
  Q_URGENT_NOT_IMPORTANT, Q_NOT_URGENT_NOT_IMPORTANT,
} from '../constants';

const getEmptyText = (categoryId, activeFilter) => {
  const catObj = TASK_CATEGORY_MAP[activeFilter];
  const cat = catObj ? catObj.label : null;
  if (cat) {
    switch (categoryId) {
      case Q_URGENT_IMPORTANT:         return `No ${cat} tasks here`;
      case Q_NOT_URGENT_IMPORTANT:     return `Nothing planned for ${cat}`;
      case Q_URGENT_NOT_IMPORTANT:     return `Clear for ${cat} 🚀`;
      case Q_NOT_URGENT_NOT_IMPORTANT: return `No ${cat} tasks ✨`;
    }
  }
  switch (categoryId) {
    case Q_URGENT_IMPORTANT:         return '🎉 Great job! Clear quadrant.';
    case Q_NOT_URGENT_IMPORTANT:     return 'Nothing pending here. Plan ahead!';
    case Q_URGENT_NOT_IMPORTANT:     return 'No immediate distractions! 🚀';
    case Q_NOT_URGENT_NOT_IMPORTANT: return 'Clean slate! Enjoy your time.';
    default: return 'No tasks';
  }
};

export default function TaskQuadrant({
  categoryId, tasks, onComplete, onDelete, onEdit, onMove, activeFilter, searchQuery,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getCategoryColor = (catId) => {
    switch (catId) {
      case Q_URGENT_IMPORTANT:         return theme.colors.q1;
      case Q_NOT_URGENT_IMPORTANT:     return theme.colors.q2;
      case Q_URGENT_NOT_IMPORTANT:     return theme.colors.q3;
      case Q_NOT_URGENT_NOT_IMPORTANT: return theme.colors.q4;
      default: return theme.colors.surfaceHighlight;
    }
  };

  const nowSec = Math.floor(Date.now() / 1000);
  let categoryTasks = tasks.filter(t => t.category === categoryId);

  // Apply category filter
  if (activeFilter !== TC_ALL) {
    categoryTasks = categoryTasks.filter(t => t.taskCategory === activeFilter);
  }

  // Apply search query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    if (q === 'overdue') {
      categoryTasks = categoryTasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds < nowSec);
    } else if (q === 'completed') {
      categoryTasks = categoryTasks.filter(t => t.completed);
    } else {
      categoryTasks = categoryTasks.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.taskCategory?.toLowerCase().includes(q)
      );
    }
  }

  const color = getCategoryColor(categoryId);
  const activeCount = categoryTasks.filter(t => !t.completed).length;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.header, { backgroundColor: color + '20' }]}>
        <Text style={[styles.title, { color }]}>{CATEGORY_LABELS[categoryId]}</Text>
        <Text style={styles.count}>{activeCount}</Text>
      </View>
      <ScrollView style={styles.list} nestedScrollEnabled contentContainerStyle={styles.listContent}>
        {categoryTasks.length === 0 ? (
          <Text style={styles.emptyText}>{getEmptyText(categoryId, activeFilter)}</Text>
        ) : (
          categoryTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onMove={onMove}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.l,
    borderWidth: 1,
    overflow: 'hidden',
    margin: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    padding: theme.spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceHighlight,
  },
  title: { fontWeight: 'bold', fontSize: 12, flex: 1 },
  count: {
    color: theme.colors.text,
    fontSize: 12,
    backgroundColor: theme.colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 4,
  },
  list: { flex: 1 },
  listContent: { padding: theme.spacing.s },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.m,
    fontStyle: 'italic',
    fontSize: 12,
  },
});
