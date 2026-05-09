import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext';
import TaskItem from '../TaskItem';

export default function UnscheduledTasks({ tasks, onComplete, onDelete, onEdit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!tasks || tasks.length === 0) return null;

  return (
    <View style={styles.container}><Text style={styles.sectionTitle}>Still To Schedule</Text>
      <View style={styles.inboxWrapper}>{tasks.map(task => <TaskItem key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />)}</View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginLeft: 8, opacity: 0.8 },
  inboxWrapper: { paddingHorizontal: 8 },
});
