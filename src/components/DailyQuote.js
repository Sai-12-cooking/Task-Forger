import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

const QUOTES = [
  "What gets scheduled, gets done.",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities. — Stephen Covey",
  "Done is better than perfect.",
  "Work expands to fill the time available. — Parkinson's Law",
  "Either run the day or the day runs you. — Jim Rohn",
  "Energy, not time, is the fundamental currency of performance.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "Productivity is never an accident — it is always the result of a commitment to excellence.",
  "If you spend too much time thinking about a thing, you'll never get it done. — Bruce Lee",
  "One task at a time. One day at a time.",
  "You don't rise to the level of your goals, you fall to the level of your systems. — James Clear",
  "Small daily improvements lead to stunning results.",
  "The most important task is the one you're avoiding.",
  "Clarity leads to power. Power leads to action. Action leads to results.",
  "Plan more than you think you need to. Execute more than you planned.",
  "Eat the frog — tackle the hardest task first.",
  "Your future self is watching you right now through your memories.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Think big, act small, move fast.",
  "Discipline is choosing between what you want now and what you want most.",
  "Simple, clear purpose and principles give rise to complex, intelligent behavior.",
  "Time you enjoy wasting is not wasted time.",
  "Motivation gets you going, discipline keeps you growing.",
  "Every moment spent planning saves three or four in execution.",
  "Focus is saying no to 1000 good ideas.",
  "Take care of the minutes, and the hours will take care of themselves.",
  "Excellence is not a destination but a continuous journey.",
  "Start where you are. Use what you have. Do what you can.",
  "Consistent effort compounds into extraordinary results.",
];

export default function DailyQuote() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const quote = useMemo(() => { const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000); return QUOTES[dayOfYear % QUOTES.length]; }, []);
  const parts = quote.split(' — '); const text = parts[0]; const author = parts[1];

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.text}>"{text}"</Text>
      {author && <Text style={styles.author}>— {author}</Text>}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { backgroundColor: theme.colors.primary + '10', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.primary + '30' },
  icon: { fontSize: 14, marginBottom: 4 },
  text: { color: theme.colors.textSecondary, fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  author: { color: theme.colors.primary, fontSize: 11, fontWeight: '600', marginTop: 6 },
});
