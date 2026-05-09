import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';

const TABS = [
  { id: 'tasks', icon: '✅', label: 'Tasks' },
  { id: 'habits', icon: '🔥', label: 'Habits' },
  { id: 'calendar', icon: '📅', label: 'Agenda' },
  { id: 'focus', icon: '⏱️', label: 'Focus' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function Navigation({ activeTab, onChangeTab, isDesktop, focusMode, isNavLocked }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Compute the visually active tab — the focus icon should highlight when focusMode is on
  const visualActiveTab = focusMode ? 'focus' : activeTab;

  const handleTabPress = (tabId) => {
    onChangeTab(tabId);
  };

  if (isDesktop) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
            <Text style={{fontSize: 24}}>⬛</Text>
        </View>
        {TABS.map(t => {
          const isLockedOut = isNavLocked && t.id !== 'focus';
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.sideBtn, visualActiveTab === t.id && styles.sideBtnActive, isLockedOut && styles.lockedOut]}
              onPress={() => handleTabPress(t.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, visualActiveTab === t.id && styles.iconActive]}>{t.icon}</Text>
              <Text style={[styles.label, visualActiveTab === t.id && styles.labelActive]}>{t.label}</Text>
              {isLockedOut && <Text style={styles.lockIconOverlay}>🔒</Text>}
            </TouchableOpacity>
          )
        })}
      </View>
    );
  }

  return (
    <View style={styles.bottomNav}>
      {TABS.map(t => {
        const isLockedOut = isNavLocked && t.id !== 'focus';
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.bottomBtn, isLockedOut && styles.lockedOut]}
            onPress={() => handleTabPress(t.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.bottomIconWrap, visualActiveTab === t.id && styles.bottomIconWrapActive]}>
              <Text style={[styles.icon, visualActiveTab === t.id && styles.iconActive]}>{t.icon}</Text>
            </View>
            <Text style={[styles.miniLabel, visualActiveTab === t.id && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  sidebar: {
    width: 72, 
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.surfaceHighlight,
    alignItems: 'center',
    paddingTop: 20,
    zIndex: 100,
  },
  logoContainer: { height: 40, marginBottom: 30, justifyContent: 'center' },
  sideBtn: {
    width: 60,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  sideBtnActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  lockedOut: {
    opacity: 0.3,
  },
  lockIconOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
    opacity: 0.8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceHighlight,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, 
    paddingTop: 12,
    zIndex: 100,
  },
  bottomBtn: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  bottomIconWrap: {
    width: 48,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomIconWrapActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  icon: { fontSize: 20, opacity: 0.5, marginBottom: 2 },
  iconActive: { opacity: 1 },
  label: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '500' },
  labelActive: { color: theme.colors.primary, fontWeight: 'bold' },
  miniLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '500' },
});
