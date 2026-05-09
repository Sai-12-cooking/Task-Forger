import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import uuid from 'react-native-uuid';
import { TASK_CATEGORIES } from '../constants';

const HABIT_EMOJIS = ['💪', '🧘', '📚', '💧', '📝', '🏃', '🥗', '🧠', '💼', '💻', '🌙', '☀️'];
const FREQUENCIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
];

export default function AddHabitModal({ visible, onClose, onAdd, initialHabit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [category, setCategory] = useState(TASK_CATEGORIES[0].id);
  const [frequency, setFrequency] = useState('daily');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (visible && initialHabit) {
      setName(initialHabit.name); setIcon(initialHabit.icon); setCategory(initialHabit.category); setFrequency(initialHabit.frequency);
    } else if (visible && !initialHabit) {
      setName(''); setIcon('💪'); setCategory(TASK_CATEGORIES[0].id); setFrequency('daily');
    }
    setShowCategoryPicker(false);
  }, [visible, initialHabit]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a habit name'); return; }
    const newHabit = { id: initialHabit ? initialHabit.id : uuid.v4(), name: name.trim(), icon, category, frequency, active: true, createdAt: initialHabit ? initialHabit.createdAt : Math.floor(Date.now() / 1000) };
    onAdd(newHabit); onClose();
  };

  const selectedCatObj = TASK_CATEGORIES.find(c => c.id === category);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalContent}>
            <Text style={styles.title}>{initialHabit ? 'Edit Habit' : 'New Habit'}</Text>
            <TextInput style={styles.input} placeholder="E.g., Read 20 pages..." placeholderTextColor={theme.colors.textSecondary} value={name} onChangeText={setName} />
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.iconBtn, icon === e && styles.iconBtnActive]} onPress={() => setIcon(e)}>
                  <Text style={styles.iconEmoji}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.freqRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity key={f.id} style={[styles.freqChip, frequency === f.id && styles.freqChipActive]} onPress={() => setFrequency(f.id)}>
                  <Text style={[styles.freqText, frequency === f.id && styles.freqTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={[styles.categoryDropdown, { borderColor: selectedCatObj?.color ?? '#444' }]} onPress={() => setShowCategoryPicker(v => !v)} activeOpacity={0.8}>
              <Text style={styles.categoryDropdownText}>{selectedCatObj?.emoji} {selectedCatObj?.label}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{showCategoryPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.categoryList}>
                {TASK_CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id} style={[styles.categoryOption, category === cat.id && { backgroundColor: cat.color + '22' }]} onPress={() => { setCategory(cat.id); setShowCategoryPicker(false); }}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryOptionText}>{cat.emoji} {cat.label}</Text>
                    {category === cat.id && <Text style={{ color: cat.color, marginLeft: 'auto' }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.btn, styles.saveBtn]}><Text style={styles.btnText}>Save Habit</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.m },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.l, padding: theme.spacing.l, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: theme.spacing.m },
  input: { backgroundColor: theme.colors.surfaceHighlight, color: theme.colors.text, padding: theme.spacing.m, borderRadius: theme.radii.m, marginBottom: theme.spacing.m, fontSize: 15 },
  label: { color: theme.colors.text, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  iconBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '25' },
  iconEmoji: { fontSize: 20 },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  freqChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, backgroundColor: theme.colors.surfaceHighlight },
  freqChipActive: { borderColor: theme.colors.secondary, backgroundColor: theme.colors.secondary + '25' },
  freqText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  freqTextActive: { color: theme.colors.secondary },
  categoryDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: theme.radii.m, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: theme.colors.surfaceHighlight, marginBottom: 4 },
  categoryDropdownText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  categoryList: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.m, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  categoryOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  categoryOptionText: { color: theme.colors.text, fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.m, gap: 8 },
  btn: { flex: 1, padding: theme.spacing.m, borderRadius: theme.radii.m, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.textSecondary },
  saveBtn: { backgroundColor: theme.colors.primary },
  btnText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 14 },
});
