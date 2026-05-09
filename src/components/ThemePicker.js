import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { THEMES } from '../styles';
import { useTheme } from '../ThemeContext';

export default function ThemePicker() {
  const { themeId, setTheme } = useTheme();

  return (
    <View style={styles.row}>
      {Object.values(THEMES).map(t => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setTheme(t.id)}
          style={[
            styles.swatch,
            { backgroundColor: t.swatch },
            themeId === t.id && styles.swatchActive,
          ]}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {themeId === t.id && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer', transition: 'transform 0.15s ease' } }),
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
