import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import MiniCalendar from './MiniCalendar';
import TodaysAgenda from './TodaysAgenda';
import StatsPanel from './StatsPanel';
import DailyQuote from './DailyQuote';

const TABS = [
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'stats',    label: '📊 Stats' },
];

export default function RightPanel({ tasks, habits, logs, onComplete, onDelete, onEdit, onToggleHabit, selectedDate, onSelectDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)} activeOpacity={0.8}>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 'calendar' ? (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <DailyQuote />
          <MiniCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} tasks={tasks} />
          <TodaysAgenda tasks={tasks} habits={habits} logs={logs} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} onToggleHabit={onToggleHabit} selectedDate={selectedDate} />
        </ScrollView>
      ) : (
        <StatsPanel tasks={tasks} habits={habits} logs={logs} />
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 10, borderLeftWidth: 1, borderLeftColor: theme.colors.surfaceHighlight },
  tabRow: { flexDirection: 'row', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 10, padding: 3, marginBottom: 10, gap: 3 },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 },
  tabLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tabLabelActive: { color: theme.colors.text },
});
