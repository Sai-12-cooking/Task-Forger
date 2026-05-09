import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../ThemeContext';

const INSIGHT_ANIM_MS = 400;
const ROTATE_MS       = 7000;

function generateInsights(tasks, theme) {
  const now = Math.floor(Date.now() / 1000);
  const msgs = [];

  const overdue = tasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds < now);
  if (overdue.length > 0) {
    msgs.push({ text: `🔴 ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} need your attention`, color: '#FF5252' });
  }

  const doneToday = tasks.filter(t => {
    if (!t.completed) return false;
    const d = new Date(t.dueDateSeconds * 1000);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  if (doneToday >= 5) msgs.push({ text: `🔥 ${doneToday} tasks crushed today! You're on a streak!`, color: '#FFB142' });
  else if (doneToday >= 1) msgs.push({ text: `✅ ${doneToday} task${doneToday > 1 ? 's' : ''} completed today — keep it up!`, color: '#4CAF50' });

  const pending = tasks.filter(t => !t.completed).length;
  if (pending >= 10) msgs.push({ text: `📋 ${pending} tasks pending — consider delegating or deferring some`, color: '#FF9F43' });
  else if (pending === 0) msgs.push({ text: '🎉 All tasks complete! You\'re a productivity legend!', color: '#4CAF50' });

  const q1 = tasks.filter(t => !t.completed && t.category === 'ur_im').length;
  if (q1 >= 4) msgs.push({ text: `⚡ ${q1} urgent & important tasks — focus mode recommended!`, color: '#FF5252' });

  if (msgs.length === 0) msgs.push({ text: '💡 Add your first task to get started!', color: theme.colors.primary });

  return msgs;
}

export default function InsightsBar({ tasks }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insights = generateInsights(tasks, theme);
  const [idx, setIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: INSIGHT_ANIM_MS, useNativeDriver: true }).start(() => {
        setIdx(i => (i + 1) % insights.length);
        Animated.timing(opacity, { toValue: 1, duration: INSIGHT_ANIM_MS, useNativeDriver: true }).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [insights.length]);

  const current = insights[idx % insights.length];

  return (
    <Animated.View style={[styles.bar, { opacity, borderLeftColor: current.color }]}>
      <Text style={[styles.text, { color: current.color }]}>{current.text}</Text>
      {insights.length > 1 && (
        <View style={styles.dots}>
          {insights.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === idx % insights.length ? current.color : '#444' }]} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 7, borderLeftWidth: 3, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceHighlight },
  text: { fontSize: 12, fontWeight: '500', flex: 1 },
  dots: { flexDirection: 'row', gap: 4, marginLeft: 10 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
