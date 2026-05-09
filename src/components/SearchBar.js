import React, { useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function SearchBar({ value, onChangeText, focusMode, onToggleFocus, searchRef, activeTaskName }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;

  if (focusMode) {
    return (
      <View style={styles.focusTopBar}>
        <View style={styles.focusSearchWrapper}>
          <Text style={styles.icon}>🔍</Text>
          <TextInput ref={searchRef} style={styles.focusInput} value={value} onChangeText={onChangeText}
            placeholder="Search tasks…" placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <View style={styles.focusCenterWrapper} pointerEvents="none">
          <Text style={styles.focusTaskName} numberOfLines={1}>{activeTaskName || 'Unstructured Focus'}</Text>
        </View>
        <TouchableOpacity style={styles.focusExitBtn} onPress={onToggleFocus} activeOpacity={0.8}>
          <Text style={styles.focusExitText}>Exit Focus</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, isDesktop && styles.wrapperDesktop]}>
      <View style={[styles.inputRow, isDesktop && styles.inputRowDesktop]}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput ref={searchRef} style={styles.input} value={value} onChangeText={onChangeText}
          placeholder="Search tasks…" placeholderTextColor={theme.colors.textSecondary} />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={[styles.focusBtn, focusMode && styles.focusBtnActive]} onPress={onToggleFocus} activeOpacity={0.8}>
        <Text style={styles.focusEmoji}>🎯</Text>
        <Text style={[styles.focusLabel, focusMode && styles.focusLabelActive]}>{focusMode ? 'Exit Focus' : 'Focus'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  focusTopBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, zIndex: 10, backgroundColor: '#090909' },
  focusSearchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: 140 },
  focusInput: { flex: 1, color: theme.colors.text, fontSize: 12, marginLeft: 6, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  focusCenterWrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: -1 },
  focusTaskName: { color: '#E0E0E0', fontSize: 14, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  focusExitBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FF5252', backgroundColor: 'rgba(255,82,82,0.1)', shadowColor: '#FF5252', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  focusExitText: { color: '#FF5252', fontSize: 12, fontWeight: '700' },
  wrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceHighlight },
  wrapperDesktop: {},
  inputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 8, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, ...Platform.select({ web: { transition: 'box-shadow 0.2s ease' } }) },
  inputRowDesktop: { maxWidth: 420, flex: 0, flexGrow: 1, flexShrink: 1, flexBasis: '45%' },
  icon: { fontSize: 14 },
  input: { flex: 1, color: theme.colors.text, fontSize: 13, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  clear: { color: theme.colors.textSecondary, fontSize: 12, padding: 2 },
  focusBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, backgroundColor: theme.colors.surface },
  focusBtnActive: { backgroundColor: 'rgba(255,82,82,0.15)', borderColor: '#FF5252', shadowColor: '#FF5252', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  focusEmoji: { fontSize: 14 },
  focusLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  focusLabelActive: { color: '#FF5252' },
});
