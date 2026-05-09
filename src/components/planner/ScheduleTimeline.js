import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext';
import TaskItem from '../TaskItem';
import { TASK_CATEGORY_MAP } from '../../constants';

export default function ScheduleTimeline({ tasks, onComplete, onDelete, onEdit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!tasks || tasks.length === 0) {
    return (
      <View style={styles.container}><Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.emptyCard}><Text style={styles.emptyText}>No scheduled blocks today.</Text></View></View>
    );
  }

  const sortedTasks = [...tasks].sort((a,b) => a.dueDateSeconds - b.dueDateSeconds);
  const formatTime = (secs) => new Date(secs * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.container}><Text style={styles.sectionTitle}>Today's Schedule</Text>
      <View style={styles.timelineWrapper}><View style={styles.timelineLine} />
        {sortedTasks.map(task => {
          const catColor = TASK_CATEGORY_MAP[task.taskCategory]?.color || theme.colors.primary;
          return (
            <View key={task.id} style={styles.timelineRow}>
              <View style={styles.timeColumn}><Text style={styles.timeText}>{formatTime(task.dueDateSeconds)}</Text></View>
              <View style={styles.nodeColumn}><View style={[styles.nodeDot, { backgroundColor: catColor }]} /></View>
              <View style={styles.taskColumn}><TaskItem task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} /></View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 16, marginLeft: 8 },
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.m, padding: 20, alignItems: 'center', marginHorizontal: 8 },
  emptyText: { color: theme.colors.textSecondary, fontStyle: 'italic' },
  timelineWrapper: { position: 'relative', marginLeft: 8 },
  timelineLine: { position: 'absolute', left: 64, top: 10, bottom: 10, width: 2, backgroundColor: theme.colors.surfaceHighlight },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timeColumn: { width: 50, paddingTop: 16, alignItems: 'flex-end', marginRight: 8 },
  timeText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' },
  nodeColumn: { width: 14, alignItems: 'center', paddingTop: 18 },
  nodeDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: theme.colors.surface, zIndex: 2 },
  taskColumn: { flex: 1, paddingLeft: 12 },
});
