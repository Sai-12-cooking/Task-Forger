import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Q_URGENT_IMPORTANT, Q_NOT_URGENT_IMPORTANT, Q_URGENT_NOT_IMPORTANT, Q_NOT_URGENT_NOT_IMPORTANT, TASK_CATEGORIES, TC_OTHERS, RECUR_NONE, RECUR_OPTIONS } from '../constants';
import uuid from 'react-native-uuid';
import { scheduleTaskReminder } from '../utils/notifications';

const QUADRANTS = [
  { id: Q_URGENT_IMPORTANT, short: 'Important & Urgent', color: '#FF5252' },
  { id: Q_NOT_URGENT_IMPORTANT, short: 'Important & Not Urgent', color: '#FF4081' },
  { id: Q_URGENT_NOT_IMPORTANT, short: 'Not Important & Urgent', color: '#FFB142' },
  { id: Q_NOT_URGENT_NOT_IMPORTANT, short: 'Not Imp. & Not Urgent', color: '#7C4DFF' },
];

export default function AddTaskModal({ visible, onClose, onAdd, initialTask, selectedDate }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [quadrant, setQuadrant] = useState(Q_URGENT_IMPORTANT);
  const [taskCategory, setTaskCategory] = useState(TC_OTHERS);
  const [recurringType, setRecurringType] = useState(RECUR_NONE);
  const [enableReminder, setEnableReminder] = useState(false);
  const [hour, setHour] = useState('23');
  const [minute, setMinute] = useState('59');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());

  const handleHourChange = (text) => { const n = text.replace(/[^0-9]/g, ''); if (n === '') { setHour(''); return; } setHour(parseInt(n, 10) > 23 ? '23' : n); };
  const handleMinuteChange = (text) => { const n = text.replace(/[^0-9]/g, ''); if (n === '') { setMinute(''); return; } setMinute(parseInt(n, 10) > 59 ? '59' : n); };
  const handleHourBlur = () => setHour(prev => prev === '' ? '00' : prev.padStart(2, '0'));
  const handleMinuteBlur = () => setMinute(prev => prev === '' ? '00' : prev.padStart(2, '0'));

  useEffect(() => {
    if (visible && initialTask) {
      setName(initialTask.name); setQuadrant(initialTask.category);
      setTaskCategory(initialTask.taskCategory ?? TC_OTHERS); setRecurringType(initialTask.recurringType ?? RECUR_NONE);
      setEnableReminder(initialTask.reminderEnabled ?? !!initialTask.notificationId);
      if (initialTask.dueDateSeconds) {
        const d = new Date(initialTask.dueDateSeconds * 1000); setTaskDate(d);
        setHour(d.getHours().toString().padStart(2, '0')); setMinute(d.getMinutes().toString().padStart(2, '0'));
      } else { setTaskDate(selectedDate instanceof Date ? selectedDate : new Date()); setHour('23'); setMinute('59'); }
    } else if (visible && !initialTask) {
      setName(''); setQuadrant(Q_URGENT_IMPORTANT); setTaskCategory(TC_OTHERS); setRecurringType(RECUR_NONE);
      setEnableReminder(false); setHour('23'); setMinute('59'); setTaskDate(selectedDate instanceof Date ? selectedDate : new Date());
    }
    setShowCategoryPicker(false);
  }, [visible, initialTask, selectedDate]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a task name'); return; }
    const pH = parseInt(hour, 10); const pM = parseInt(minute, 10);
    const vH = (isNaN(pH) || pH < 0 || pH > 23) ? 23 : pH;
    const vM = (isNaN(pM) || pM < 0 || pM > 59) ? 59 : pM;
    const targetDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), vH, vM, 59);
    const dueDateSeconds = Math.floor(targetDate.getTime() / 1000);
    const newTask = { id: initialTask ? initialTask.id : uuid.v4(), name: name.trim(), category: quadrant, taskCategory, recurringType, completed: initialTask ? initialTask.completed : false, createdAt: initialTask ? initialTask.createdAt : Math.floor(Date.now() / 1000), dueDateSeconds, notificationId: initialTask ? initialTask.notificationId : null, reminderEnabled: enableReminder };
    const isNewReminder = enableReminder && !initialTask;
    const isRescheduled = enableReminder && initialTask && (initialTask.dueDateSeconds !== dueDateSeconds || !initialTask.notificationId);
    if (dueDateSeconds && (isNewReminder || isRescheduled)) { const notifId = await scheduleTaskReminder(newTask.name, dueDateSeconds); newTask.notificationId = notifId; }
    else if (!enableReminder) { newTask.notificationId = null; }
    onAdd(newTask); onClose();
  };

  const selectedCatObj = TASK_CATEGORIES.find(c => c.id === taskCategory);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalContent}>
            <Text style={styles.title}>{initialTask ? 'Edit Task' : 'New Task'}</Text>
            <TextInput style={styles.input} placeholder="Task name..." placeholderTextColor={theme.colors.textSecondary} value={name} onChangeText={setName} autoFocus />
            <View style={{ marginBottom: 12 }}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Scheduled Date</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <TouchableOpacity onPress={() => setTaskDate(new Date(taskDate.getTime() - 86400000))} style={styles.dateArrow}><Text style={styles.dateArrowText}>{'<'}</Text></TouchableOpacity>
                  <Text style={[styles.dateChip, { color: theme.colors.primary, backgroundColor: theme.colors.primary + '25' }]}>{MONTHS[taskDate.getMonth()]} {taskDate.getDate()}, {taskDate.getFullYear()}</Text>
                  <TouchableOpacity onPress={() => setTaskDate(new Date(taskDate.getTime() + 86400000))} style={styles.dateArrow}><Text style={styles.dateArrowText}>{'>'}</Text></TouchableOpacity>
                </View>
              </View>
              <View style={styles.quickDateRow}>
                <TouchableOpacity style={styles.quickDateBtn} onPress={() => setTaskDate(new Date())}><Text style={styles.quickDateText}>Today</Text></TouchableOpacity>
                <TouchableOpacity style={styles.quickDateBtn} onPress={() => setTaskDate(new Date(Date.now() + 86400000))}><Text style={styles.quickDateText}>Tomorrow</Text></TouchableOpacity>
                <TouchableOpacity style={styles.quickDateBtn} onPress={() => setTaskDate(new Date(Date.now() + 7 * 86400000))}><Text style={styles.quickDateText}>Next Week</Text></TouchableOpacity>
              </View>
            </View>
            <View style={[styles.switchRow, { marginBottom: 14 }]}>
              <Text style={styles.label}>Due Time (24h)</Text>
              <View style={styles.timeInputBox}>
                <TextInput style={styles.timeInput} keyboardType="number-pad" maxLength={2} value={hour} onChangeText={handleHourChange} onBlur={handleHourBlur} placeholder="23" placeholderTextColor="#666" />
                <Text style={{color: '#888', fontWeight: 'bold'}}>:</Text>
                <TextInput style={styles.timeInput} keyboardType="number-pad" maxLength={2} value={minute} onChangeText={handleMinuteChange} onBlur={handleMinuteBlur} placeholder="59" placeholderTextColor="#666" />
              </View>
            </View>
            <Text style={[styles.label, { marginBottom: 8 }]}>Matrix Quadrant</Text>
            <View style={styles.quadrantGrid}>
              {QUADRANTS.map(q => (
                <TouchableOpacity key={q.id} style={[styles.quadrantBtn, quadrant === q.id && { borderColor: q.color, backgroundColor: q.color + '22' }]} onPress={() => setQuadrant(q.id)} activeOpacity={0.75}>
                  <View style={[styles.quadrantDot, { backgroundColor: q.color }]} />
                  <Text style={[styles.quadrantLabel, quadrant === q.id && { color: q.color }]}>{q.short}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { marginBottom: 8, marginTop: 4 }]}>Category</Text>
            <TouchableOpacity style={[styles.categoryDropdown, { borderColor: selectedCatObj?.color ?? '#444' }]} onPress={() => setShowCategoryPicker(v => !v)} activeOpacity={0.8}>
              <Text style={styles.categoryDropdownText}>{selectedCatObj?.emoji}  {selectedCatObj?.label}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{showCategoryPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.categoryList}>
                {TASK_CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id} style={[styles.categoryOption, taskCategory === cat.id && { backgroundColor: cat.color + '22' }]} onPress={() => { setTaskCategory(cat.id); setShowCategoryPicker(false); }}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryOptionText}>{cat.emoji} {cat.label}</Text>
                    {taskCategory === cat.id && <Text style={{ color: cat.color, marginLeft: 'auto' }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={[styles.label, { marginBottom: 8, marginTop: 8 }]}>Repeat</Text>
            <View style={styles.recurRow}>
              {RECUR_OPTIONS.map(r => (
                <TouchableOpacity key={r.id} style={[styles.recurChip, recurringType === r.id && styles.recurChipActive]} onPress={() => setRecurringType(r.id)}>
                  <Text style={[styles.recurChipText, recurringType === r.id && styles.recurChipTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.switchRow, { marginTop: 10 }]}>
              <Text style={styles.label}>Enable Reminder</Text>
              <Switch value={enableReminder} onValueChange={setEnableReminder} trackColor={{ true: theme.colors.secondary }} />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.btn, styles.saveBtn]}><Text style={styles.btnText}>Save Task</Text></TouchableOpacity>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s },
  label: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  dateChip: { fontWeight: 'bold', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dateArrow: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: theme.colors.surfaceHighlight, borderRadius: 6 },
  dateArrowText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  quickDateRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  quickDateBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  quickDateText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '500' },
  timeInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 8, paddingHorizontal: 8, borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  timeInput: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center', width: 32, paddingVertical: 6 },
  quadrantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  quadrantBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, borderRadius: theme.radii.m, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: theme.colors.surfaceHighlight },
  quadrantDot: { width: 8, height: 8, borderRadius: 4 },
  quadrantLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '500', flexShrink: 1 },
  categoryDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: theme.radii.m, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: theme.colors.surfaceHighlight, marginBottom: 4 },
  categoryDropdownText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  categoryList: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.m, marginBottom: 4, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.surfaceHighlight },
  categoryOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  categoryOptionText: { color: theme.colors.text, fontSize: 13 },
  recurRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  recurChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, backgroundColor: theme.colors.surfaceHighlight },
  recurChipActive: { borderColor: theme.colors.secondary, backgroundColor: theme.colors.secondary + '25' },
  recurChipText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  recurChipTextActive: { color: theme.colors.secondary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.m, gap: 8 },
  btn: { flex: 1, padding: theme.spacing.m, borderRadius: theme.radii.m, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.textSecondary },
  saveBtn: { backgroundColor: theme.colors.primary },
  btnText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 14 },
});
