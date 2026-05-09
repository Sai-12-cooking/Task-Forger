import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { Q_URGENT_IMPORTANT } from '../constants';

function getTodayString() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

export default function DailyBriefingModal({ visible, onClose, tasks }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [show, setShow] = useState(false);
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    if (visible === true) { setShow(true); return; }
    if (visible === false) { setShow(false); return; }
    (async () => { const todayStr = getTodayString(); const lastLogin = await AsyncStorage.getItem('@last_briefing_date'); const hour = new Date().getHours(); setIsEvening(hour >= 17); if (lastLogin !== todayStr) { setShow(true); await AsyncStorage.setItem('@last_briefing_date', todayStr); } })();
  }, [visible]);

  if (!show) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const overdue = tasks.filter(t => !t.completed && t.dueDateSeconds && t.dueDateSeconds < nowSec);
  const urgent = tasks.filter(t => !t.completed && t.category === Q_URGENT_IMPORTANT);
  const plannedToday = tasks.filter(t => { if (t.completed || !t.dueDateSeconds) return false; const d = new Date(t.dueDateSeconds * 1000); const today = new Date(); return d.toDateString() === today.toDateString(); });
  const todayStart = new Date(); todayStart.setHours(0,0,0,0); const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const completedToday = tasks.filter(t => t.completed && t.completedAt && (t.completedAt >= todayStart.getTime()/1000 && t.completedAt <= todayEnd.getTime()/1000));
  const handleClose = () => { setShow(false); onClose?.(); };

  return (
    <Modal visible={show} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.greeting}>{isEvening ? '🌙 Evening Review' : '☀️ Good Morning'}</Text>
          <Text style={styles.subtext}>{isEvening ? "Let's see what you accomplished today." : "Here is your operational briefing for today."}</Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {isEvening ? (
              <>
                <View style={[styles.card, { borderLeftColor: '#4CAF50' }]}><Text style={styles.cardVal}>{completedToday.length}</Text><Text style={styles.cardLabel}>Tasks Completed Today</Text></View>
                {completedToday.slice(0, 5).map(t => <Text key={t.id} style={styles.taskBullet} numberOfLines={1}>✅ {t.name}</Text>)}
                {completedToday.length > 5 && <Text style={styles.taskBullet}>...and {completedToday.length - 5} more.</Text>}
                <View style={[styles.card, { borderLeftColor: theme.colors.primary, marginTop: 12 }]}><Text style={styles.cardVal}>{urgent.length}</Text><Text style={styles.cardLabel}>Urgent Tasks Remaining</Text></View>
              </>
            ) : (
              <>
                {overdue.length > 0 && <View style={[styles.card, { borderLeftColor: '#FF5252' }]}><Text style={[styles.cardVal, { color: '#FF5252' }]}>{overdue.length}</Text><Text style={styles.cardLabel}>Overdue Tasks</Text></View>}
                <View style={[styles.card, { borderLeftColor: '#FFB142' }]}><Text style={[styles.cardVal, { color: '#FFB142' }]}>{urgent.length}</Text><Text style={styles.cardLabel}>Urgent & Important</Text></View>
                <View style={[styles.card, { borderLeftColor: theme.colors.secondary }]}><Text style={[styles.cardVal, { color: theme.colors.secondary }]}>{plannedToday.length}</Text><Text style={styles.cardLabel}>Planned for Today</Text></View>
              </>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.btn} onPress={handleClose} activeOpacity={0.8}><Text style={styles.btnText}>{isEvening ? 'Rest Well' : "Let's Get to Work"}</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: theme.colors.surfaceHighlight, width: '100%', maxWidth: 400, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: theme.colors.surfaceHighlight, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  subtext: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20 },
  scroll: { maxHeight: 300, marginBottom: 20 },
  card: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderLeftWidth: 4, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardVal: { fontSize: 24, fontWeight: '800', color: theme.colors.text, width: 32, textAlign: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  taskBullet: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 6, marginLeft: 10 },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
});
