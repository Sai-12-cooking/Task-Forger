import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';
import { TC_ALL, TASK_CATEGORIES, TASK_CATEGORY_MAP } from '../constants';

export default function FilterBar({ activeFilter, onFilterChange }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const filters = [{ id: TC_ALL, label: 'All', emoji: '⚡' }, ...TASK_CATEGORIES];

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {filters.map(f => {
          const isActive = activeFilter === f.id;
          const catColor = TASK_CATEGORY_MAP[f.id]?.color ?? theme.colors.primary;
          return (
            <TouchableOpacity key={f.id}
              style={[styles.chip, isActive && styles.chipActive, isActive && f.id !== TC_ALL && { borderColor: catColor, shadowColor: catColor }]}
              onPress={() => onFilterChange(f.id)} activeOpacity={0.75}>
              <Text style={styles.chipEmoji}>{f.emoji}</Text>
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrapper: { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceHighlight, paddingVertical: 8 },
  container: { paddingHorizontal: 12, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, backgroundColor: theme.colors.surface, gap: 5, ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } }) },
  chipActive: { backgroundColor: theme.colors.primary + '25', borderColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 3 },
  chipEmoji: { fontSize: 14 },
  chipLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipLabelActive: { color: theme.colors.text, fontWeight: '700' },
});
