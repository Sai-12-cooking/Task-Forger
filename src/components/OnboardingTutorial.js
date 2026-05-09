import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useTheme } from '../ThemeContext';

const SLIDES = [
  { key: '1', title: 'Welcome to Task Forge', description: 'Your premium productivity operating system for planning, focusing, building habits, and improving consistency.', icon: '🏆' },
  { key: '2', title: 'The Eisenhower Matrix', description: 'Prioritize flawlessly. Categorize your tasks into Urgent and Important. Focus on what moves the needle, eliminate the rest.', icon: '📋' },
  { key: '3', title: 'Master Your Habits', description: 'Track routines like workouts, meditation, and hydration to build unstoppable momentum and visualize your streak.', icon: '🔥' },
  { key: '4', title: 'Deep Work with Focus Mode', description: 'Enter a distraction-free Pomodoro state. Navigation will lock to ensure you remain fully immersed until the block completes.', icon: '⏱' },
  { key: '5', title: 'Track Your Growth', description: 'Analyze consistency, completion scores, and deep-work metrics across your productivity journey.', icon: '📊' },
];

export default function OnboardingTutorial({ visible, onComplete }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleNext = () => { if (currentIndex < SLIDES.length - 1) setCurrentIndex(prev => prev + 1); else onComplete(); };
  const handleBack = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.slideContainer}>
              <Text style={styles.icon}>{SLIDES[currentIndex].icon}</Text>
              <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
              <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
            </View>
            <View style={styles.footer}>
              <View style={styles.dotsRow}>{SLIDES.map((_, idx) => <View key={idx} style={[styles.dot, currentIndex === idx && styles.dotActive]} />)}</View>
              <View style={styles.actionsRow}>
                {currentIndex > 0 ? (
                  <TouchableOpacity style={styles.textBtn} onPress={handleBack}><Text style={styles.textBtnLabel}>Back</Text></TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.textBtn} onPress={onComplete}><Text style={styles.textBtnLabel}>Skip</Text></TouchableOpacity>
                )}
                <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}><Text style={styles.primaryBtnLabel}>{currentIndex === SLIDES.length - 1 ? 'Enter Task Forge' : 'Next'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background + 'FA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: theme.colors.surface, width: '100%', maxWidth: 480, borderRadius: theme.radii.l, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, padding: 32, alignItems: 'center', justifyContent: 'space-between', minHeight: 400, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  slideContainer: { alignItems: 'center', marginTop: 20 },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  footer: { width: '100%', marginTop: 40 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceHighlight },
  dotActive: { backgroundColor: theme.colors.primary, width: 24 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  textBtnLabel: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' },
  primaryBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: theme.radii.m },
  primaryBtnLabel: { color: '#000', fontSize: 15, fontWeight: 'bold' },
});
