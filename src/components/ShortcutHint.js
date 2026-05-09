import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';

const SHORTCUTS = [
  { key: 'N', desc: 'New task' },
  { key: '/', desc: 'Search' },
  { key: 'F', desc: 'Focus mode' },
  { key: 'Esc', desc: 'Close modal' },
];

export default function ShortcutHint() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const handleOutsideClick = () => setVisible(false);
    const timer = setTimeout(() => { window.addEventListener('click', handleOutsideClick); }, 0);
    return () => { clearTimeout(timer); window.removeEventListener('click', handleOutsideClick); };
  }, [visible]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.btn} onPress={() => setVisible(v => !v)} activeOpacity={0.8}>
        <Text style={styles.btnText}>?</Text>
      </TouchableOpacity>
      {visible && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>Keyboard Shortcuts</Text>
          {SHORTCUTS.map(s => (
            <View key={s.key} style={styles.row}>
              <View style={styles.keyChip}><Text style={styles.keyText}>{s.key}</Text></View>
              <Text style={styles.descText}>{s.desc}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrapper: { position: 'relative' },
  btn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface, ...Platform.select({ web: { cursor: 'pointer' } }) },
  btnText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700' },
  tooltip: { position: 'absolute', top: 34, right: 0, backgroundColor: theme.colors.surfaceHighlight, borderRadius: 12, padding: 14, minWidth: 180, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8, zIndex: 999 },
  tooltipTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  keyChip: { backgroundColor: theme.colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, minWidth: 34, alignItems: 'center' },
  keyText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  descText: { color: theme.colors.textSecondary, fontSize: 12 },
});
