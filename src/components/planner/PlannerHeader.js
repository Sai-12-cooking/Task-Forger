import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function PlannerHeader({ selectedDate, scheduledCount, habitsCount }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dateObj = selectedDate instanceof Date ? selectedDate : new Date();
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const titlePrefix = isToday ? 'Today • ' : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titlePrefix}{WEEKDAYS[dateObj.getDay()]}, {MONTHS[dateObj.getMonth()]} {dateObj.getDate()}</Text>
      <Text style={styles.subtitle}>{scheduledCount} tasks scheduled • {habitsCount} habits due</Text>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 8 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
});
