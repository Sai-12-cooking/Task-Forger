import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { TC_DAILY } from '../../constants';
import PlannerHeader from './PlannerHeader';
import WeekStrip from './WeekStrip';
import ScheduleTimeline from './ScheduleTimeline';
import UnscheduledTasks from './UnscheduledTasks';
import UpcomingDeadlines from './UpcomingDeadlines';
import PlannerHabits from './PlannerHabits';
import InsightsCard from './InsightsCard';
import MiniCalendar from '../MiniCalendar';

export default function AgendaPlanner({ tasks, habits, logs, onComplete, onDelete, onEdit, onToggleHabit, selectedDate, setSelectedDate, isDesktop }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { scheduled, unscheduled } = useMemo(() => {
    const targetStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0).getTime() / 1000;
    const targetEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59).getTime() / 1000;
    const sch = []; const uns = [];
    (tasks || []).forEach(t => {
      if (t.completed) return;
      if (t.dueDateSeconds >= targetStart && t.dueDateSeconds <= targetEnd) {
        const taskD = new Date(t.dueDateSeconds * 1000);
        if (taskD.getHours() === 23 && taskD.getMinutes() === 59) uns.push(t); else sch.push(t);
      } else if (t.taskCategory === TC_DAILY) { uns.push(t); }
    });
    return { scheduled: sch, unscheduled: uns };
  }, [tasks, selectedDate]);

  const activeHabits = useMemo(() => {
    const day = selectedDate.getDay();
    return (habits || []).filter(h => { if (!h.active) return false; if (h.frequency === 'weekdays') return day !== 0 && day !== 6; return true; });
  }, [habits, selectedDate]);

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.columnLeft}><MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={tasks} /><UpcomingDeadlines tasks={tasks} selectedDate={selectedDate} /></View>
        <View style={styles.columnCenter}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
            <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={tasks} />
            <ScheduleTimeline tasks={scheduled} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
            <UnscheduledTasks tasks={unscheduled} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
          </ScrollView>
        </View>
        <View style={styles.columnRight}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
            <PlannerHeader selectedDate={selectedDate} scheduledCount={scheduled.length} habitsCount={activeHabits.length} />
            <InsightsCard tasks={tasks} selectedDate={selectedDate} />
            <PlannerHabits habits={activeHabits} logs={logs} onToggleHabit={onToggleHabit} selectedDate={selectedDate} />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mobileContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobilePad}>
      <PlannerHeader selectedDate={selectedDate} scheduledCount={scheduled.length} habitsCount={activeHabits.length} />
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={tasks} />
      <ScheduleTimeline tasks={scheduled} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
      <UnscheduledTasks tasks={unscheduled} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
      <UpcomingDeadlines tasks={tasks} selectedDate={selectedDate} />
      <PlannerHabits habits={activeHabits} logs={logs} onToggleHabit={onToggleHabit} selectedDate={selectedDate} />
      <InsightsCard tasks={tasks} selectedDate={selectedDate} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  desktopContainer: { flex: 1, flexDirection: 'row', padding: 16, gap: 20 },
  columnLeft: { flex: 1, maxWidth: 320 },
  columnCenter: { flex: 2, maxWidth: 600 },
  columnRight: { flex: 1, maxWidth: 340 },
  scrollPad: { paddingBottom: 40 },
  mobileContainer: { flex: 1 },
  mobilePad: { padding: 16, paddingBottom: 80 },
});
