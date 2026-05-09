import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

function firstDayOffset(year, month) { return new Date(year, month, 1).getDay(); }

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }

export default function MiniCalendar({ selectedDate, onSelectDate, tasks }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const now = new Date();
  const [viewYear, setViewYear] = useState(selectedDate instanceof Date ? selectedDate.getFullYear() : now.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate instanceof Date ? selectedDate.getMonth() : now.getMonth());

  const today = now.getDate(); const todayMonth = now.getMonth(); const todayYear = now.getFullYear();
  const daysInMonth = DAYS_IN_MONTH[viewMonth] + (viewMonth === 1 && isLeapYear(viewYear) ? 1 : 0);
  const offset = firstDayOffset(viewYear, viewMonth);
  const nowSec = Math.floor(Date.now() / 1000);

  const dayMap = {};
  (tasks ?? []).forEach(t => {
    if (!t.dueDateSeconds) return;
    const d = new Date(t.dueDateSeconds * 1000);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = { hasTasks: false, hasOverdue: false };
      dayMap[day].hasTasks = true;
      if (!t.completed && t.dueDateSeconds < nowSec) dayMap[day].hasOverdue = true;
    }
  });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}><Text style={styles.navText}>‹</Text></TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}><Text style={styles.navText}>›</Text></TouchableOpacity>
      </View>
      <View style={styles.daysRow}>
        {DAY_LABELS.map((d, i) => <Text key={i} style={styles.dayLabel}>{d}</Text>)}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: offset }).map((_, i) => <View key={`e${i}`} style={styles.dateCell} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday = d === today && viewMonth === todayMonth && viewYear === todayYear;
          const isSelected = selectedDate instanceof Date && d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
          const dotInfo = dayMap[d];
          return (
            <TouchableOpacity key={d} style={[styles.dateCell, isToday && styles.todayCell, isSelected && !isToday && styles.selectedCell]} onPress={() => onSelectDate(new Date(viewYear, viewMonth, d))} activeOpacity={0.7}>
              <Text style={[styles.dateText, isToday && styles.todayText, isSelected && !isToday && styles.selectedText]}>{d}</Text>
              {dotInfo && <View style={[styles.dot, { backgroundColor: dotInfo.hasOverdue ? '#FF5252' : theme.colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { backgroundColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.l, padding: theme.spacing.m, marginBottom: theme.spacing.m, maxWidth: 450, width: '100%', alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navBtn: { padding: 4 },
  navText: { color: theme.colors.text, fontSize: 20, fontWeight: '300' },
  monthLabel: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold' },
  daysRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: { width: '14.28%', textAlign: 'center', color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  todayCell: { backgroundColor: theme.colors.primary },
  selectedCell: { borderWidth: 1, borderColor: theme.colors.primary },
  dateText: { color: theme.colors.text, fontSize: 11 },
  todayText: { color: '#000', fontWeight: 'bold' },
  selectedText: { color: theme.colors.primary, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 3 },
});
