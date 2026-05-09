import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';
import { exportJSON, exportCSV } from '../utils/exportTasks';
import { saveProductivitySettings } from '../utils/storage';
import ThemePicker from './ThemePicker';

export default function SettingsView({ tasks = [], habits = [], logs = [], prodSettings, setProdSettings, onReplayTutorial }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isWeb = Platform.OS === 'web' || typeof document !== 'undefined';

  const handleFullBackup = () => { exportJSON({ tasks, habits, logs, exportDate: new Date().toISOString() }); };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>App Theme</Text>
          <ThemePicker />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity Settings</Text>
        <View style={[styles.settingRow, { marginBottom: 16 }]}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.settingLabel}>Require Focus Lock</Text>
            <Text style={styles.settingDesc} numberOfLines={2}>Blocks navigation to other tabs when a focus session is active.</Text>
          </View>
          <TouchableOpacity style={[styles.toggleWrap, prodSettings?.requireFocusLock && styles.toggleWrapOn]}
            onPress={() => { const next = { ...prodSettings, requireFocusLock: !prodSettings?.requireFocusLock }; setProdSettings(next); saveProductivitySettings(next); }} activeOpacity={0.8}>
            <View style={[styles.toggleKnob, prodSettings?.requireFocusLock && styles.toggleKnobOn]} />
          </TouchableOpacity>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={onReplayTutorial}><Text style={styles.btnTextSecondary}>Replay App Tutorial</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.settingDesc}>Task Forge is completely local, meaning your data never leaves this device. Use these tools to backup your system.</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={handleFullBackup} disabled={!isWeb}><Text style={styles.btnText}>⬇ Export Full Backup (.json)</Text></TouchableOpacity>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => exportCSV(tasks)} disabled={!isWeb}><Text style={styles.btnTextSecondary}>⬇ Export Tasks Log (.csv)</Text></TouchableOpacity>
        </View>
        {!isWeb && <Text style={[styles.settingDesc, { color: theme.colors.error, marginTop: 8 }]}>Data export is only supported firmly on Web platforms right now.</Text>}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Version</Text><Text style={styles.infoValue}>1.0.1 (Local First)</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Developer</Text><Text style={styles.infoValue}>Antigravity</Text></View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  header: { color: theme.colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  section: { backgroundColor: theme.colors.surfaceHighlight, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  sectionTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  settingDesc: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  btnRow: { marginBottom: 10 },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.textSecondary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnTextSecondary: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: theme.colors.textSecondary, fontSize: 14 },
  infoValue: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  toggleWrap: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#333', padding: 2, justifyContent: 'center' },
  toggleWrapOn: { backgroundColor: theme.colors.primary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#AAA', transform: [{ translateX: 0 }] },
  toggleKnobOn: { backgroundColor: '#FFF', transform: [{ translateX: 20 }] },
});
