import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../ThemeContext';

const DAY_LABELS = ['S','M','T','W','T','F','S'];

export default function WeekStrip({ selectedDate, onSelectDate, tasks }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scrollViewRef = useRef(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const dates = [];
  const baseDate = new Date(selectedDate); baseDate.setHours(0,0,0,0);
  for(let i = -14; i <= 14; i++) { const d = new Date(baseDate); d.setDate(baseDate.getDate() + i); dates.push(d); }
  const dayMap = {};
  (tasks || []).forEach(t => { if (!t.dueDateSeconds || t.completed) return; const d = new Date(t.dueDateSeconds * 1000); dayMap[d.toDateString()] = true; });
  useEffect(() => { if(scrollViewRef.current) setTimeout(() => { scrollViewRef.current.scrollTo({ x: 14 * 56 - 150, animated: false }); }, 50); }, [selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dates.map((d, index) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const hasTask = dayMap[d.toDateString()]; const isTodayDate = d.toDateString() === today.toDateString();
          return (
            <TouchableOpacity key={index} style={[styles.dateBlock, isSelected && styles.dateBlockSelected]} onPress={() => onSelectDate(d)} activeOpacity={0.7}>
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{DAY_LABELS[d.getDay()]}</Text>
              <Text style={[styles.dateText, isSelected && styles.dateTextSelected, isTodayDate && !isSelected && styles.dateTextToday]}>{d.getDate()}</Text>
              {hasTask && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 20, backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.l, paddingVertical: 12 },
  scrollContent: { paddingHorizontal: 8 },
  dateBlock: { width: 48, alignItems: 'center', paddingVertical: 8, marginHorizontal: 4, borderRadius: 24 },
  dateBlockSelected: { backgroundColor: theme.colors.primary },
  dayLabel: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  dayLabelSelected: { color: '#000' },
  dateText: { fontSize: 16, color: theme.colors.text, fontWeight: 'bold' },
  dateTextSelected: { color: '#000' },
  dateTextToday: { color: theme.colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.secondary, marginTop: 4 },
  dotSelected: { backgroundColor: '#000' },
});
