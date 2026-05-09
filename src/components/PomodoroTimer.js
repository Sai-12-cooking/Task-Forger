import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';
import { saveFocusSession, loadFocusSession, clearFocusSession } from '../utils/storage';

const SESSIONS = [
  { id: 'pomodoro', label: '25 / 5', work: 25 * 60, breakT: 5 * 60 },
  { id: 'deep', label: '50 / 10', work: 50 * 60, breakT: 10 * 60 },
  { id: 'ultra', label: '90 / 15', work: 90 * 60, breakT: 15 * 60 },
];

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function beep() {
  try {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    }
  } catch (_) { }
}

export default function PomodoroTimer({ activeTask, habits = [], onTimerStateChange, onHabitSelect }) {
  const { theme } = useTheme();
  
  const [sessionIdx, setSessionIdx] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(SESSIONS[0].work);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [baseTime, setBaseTime] = useState(SESSIONS[0].work);
  const [endTime, setEndTime] = useState(null);
  
  const pulse = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current; 
  const playScale = useRef(new Animated.Value(1)).current;

  const intervalRef = useRef(null);

  const session = SESSIONS[sessionIdx];
  const total = isBreak ? session.breakT : baseTime;
  const pct = remaining / total;

  const doneAnim = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [pulse]);

  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
          Animated.timing(breatheAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      breatheAnim.stopAnimation();
      breatheAnim.setValue(1);
    }
  }, [running, breatheAnim]);

  useEffect(() => {
    loadFocusSession().then(s => {
      if (s) {
        const now = Date.now();
        if (s.endTime > now) {
          setSessionIdx(s.sessionIdx);
          setIsBreak(s.isBreak);
          setSelectedHabitId(s.selectedHabitId);
          if (onHabitSelect) onHabitSelect(s.selectedHabitId);
          setBaseTime(s.baseTime);
          setEndTime(s.endTime);
          setRemaining(Math.ceil((s.endTime - now) / 1000));
          setRunning(true);
          if (onTimerStateChange) onTimerStateChange(true);
        } else {
          clearFocusSession();
        }
      }
    });
  }, []);

  const stateRef = useRef({ onTimerStateChange, selectedHabitId, baseTime, isBreak, sessionIdx });
  useEffect(() => {
    stateRef.current = { onTimerStateChange, selectedHabitId, baseTime, isBreak, sessionIdx };
  });

  useEffect(() => {
    if (running && endTime !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const rem = Math.ceil((endTime - now) / 1000);
        if (rem <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setEndTime(null);
          clearFocusSession();
          beep();
          doneAnim();
          const st = stateRef.current;
          if (st.onTimerStateChange) st.onTimerStateChange(false, 'completed', { durationSecs: st.baseTime, isBreak: st.isBreak, selectedHabitId: st.selectedHabitId });
          const nextBreak = !st.isBreak;
          setIsBreak(nextBreak);
          const nextBase = nextBreak ? SESSIONS[st.sessionIdx].breakT : SESSIONS[st.sessionIdx].work;
          setRemaining(nextBase);
        } else {
          setRemaining(rem);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, endTime, isBreak, sessionIdx, doneAnim]);

  const toggleRunning = () => {
    Animated.sequence([
       Animated.timing(playScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
       Animated.timing(playScale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();

    if (running) {
      setRunning(false);
      setEndTime(null);
      clearFocusSession();
      if (onTimerStateChange) onTimerStateChange(false, 'paused');
    } else {
      const target = Date.now() + (remaining * 1000);
      setEndTime(target);
      saveFocusSession({
        endTime: target, sessionIdx, isBreak, selectedHabitId, baseTime
      });
      setRunning(true);
      if (onTimerStateChange) onTimerStateChange(true);
    }
  };

  const changeSession = (idx) => {
    setRunning(false);
    setEndTime(null);
    clearFocusSession();
    if (onTimerStateChange) onTimerStateChange(false);
    setSessionIdx(idx);
    setIsBreak(false);
    setBaseTime(SESSIONS[idx].work);
    setRemaining(SESSIONS[idx].work);
  };

  const adjustTime = (deltaSecs) => {
    let newTime = baseTime + deltaSecs;
    if (newTime < 60) newTime = 60; // minimum 1 min
    setBaseTime(newTime);
    setRemaining(newTime);
  };

  const reset = () => {
    setRunning(false);
    setEndTime(null);
    clearFocusSession();
    if (onTimerStateChange) onTimerStateChange(false, 'reset');
    setIsBreak(false);
    setRemaining(baseTime);
  };

  const ringColor = isBreak ? theme.colors.secondary : theme.colors.primary;

  return (
    <ScrollView contentContainerStyle={styles.floatingContainer} style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
      
      {/* Presets Group */}
      <View style={styles.presetFloatingPill}>
        {SESSIONS.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.presetItem,
              sessionIdx === i ? { backgroundColor: theme.colors.surfaceHighlight, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5, elevation: 2 } : { backgroundColor: 'transparent' }
            ]}
            onPress={() => changeSession(i)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.presetText, 
              { color: sessionIdx === i ? theme.colors.text : theme.colors.textSecondary }
            ]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hero Timer */}
      <View style={styles.heroCenterpiece}>
        {/* Breathing Halo */}
        <Animated.View style={[
           styles.heroHalo,
           { 
             borderColor: ringColor, 
             transform: [{ scale: breatheAnim }], 
             opacity: breatheAnim.interpolate({ inputRange: [1, 1.08], outputRange: [running ? 0.35 : 0, 0] })
           }
        ]} />

        {/* Solid Container Ring */}
        <Animated.View style={[
           styles.heroRing, 
           { 
             borderColor: running ? ringColor : 'rgba(255,255,255,0.08)',
             shadowColor: running ? ringColor : '#000',
             shadowOpacity: running ? 0.8 : 0.4,
             shadowRadius: running ? 30 : 20,
             shadowOffset: { width: 0, height: running ? 0 : 10 },
             transform: [{ scale: pulse }]
           }
        ]}>
          <Text style={[
            styles.heroText, 
            { 
               color: running ? '#FFFFFF' : '#E0E0E0',
               textShadowColor: running ? ringColor : 'transparent',
               textShadowRadius: running ? 20 : 0,
            }
          ]}>{fmt(remaining)}</Text>
          <Text style={[styles.heroSubText, { color: ringColor }]}>
            {isBreak ? 'COFFEE BREAK' : 'DEEP FOCUS SESSION'} • {Math.round(pct * 100)}%
          </Text>

          {(!running && selectedHabitId) && (
            <View style={styles.timeAdjustContainer}>
              <TouchableOpacity onPress={() => adjustTime(-5 * 60)} style={styles.timeAdjustBtn}>
                <Text style={styles.timeAdjustBtnText}>- 5m</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(5 * 60)} style={styles.timeAdjustBtn}>
                <Text style={styles.timeAdjustBtnText}>+ 5m</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </View>

      {/* Floating Controls */}
      <View style={styles.controlsLayer}>
        <TouchableOpacity style={styles.sideBtn} onPress={reset}>
           <Text style={styles.sideBtnIcon}>↺</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: playScale }] }}>
           <TouchableOpacity 
             style={[
               styles.centerPlayBtn, 
               { 
                 backgroundColor: running ? theme.colors.surfaceHighlight : ringColor,
                 shadowColor: running ? '#000' : ringColor,
                 shadowOpacity: running ? 0.5 : 0.8,
                 shadowRadius: running ? 10 : 20,
                 shadowOffset: { width: 0, height: 8 },
                 elevation: 8
               }
             ]} 
             onPress={toggleRunning}
             activeOpacity={0.9}
           >
              <Text style={[styles.playIcon, { color: running ? theme.colors.text : '#000', marginLeft: running ? 0 : 5 }]}>
                {running ? '॥' : '▶'}
              </Text>
           </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.sideBtn} onPress={() => {
            setIsBreak(v => !v);
            setRemaining(isBreak ? session.work : session.breakT);
            setRunning(false);
        }}>
           <Text style={styles.sideBtnIcon}>{isBreak ? '💼' : '☕'}</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Habits Section */}
      {!running && habits.length > 0 && !isBreak && (
         <View style={styles.habitContainer}>
            <Text style={styles.habitHeadline}>Supports Your Habits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.habitScroll}>
               {habits.filter(h => h.active).map(h => {
                 const isSelected = selectedHabitId === h.id;
                 return (
                   <TouchableOpacity
                     key={h.id}
                     style={[
                       styles.habitFloatingPill,
                       { backgroundColor: isSelected ? ringColor + '20' : 'rgba(255,255,255,0.05)' },
                       isSelected && { borderColor: ringColor + '80', borderWidth: 1 }
                     ]}
                     onPress={() => {
                       const nextId = isSelected ? null : h.id;
                       setSelectedHabitId(nextId);
                       if (onHabitSelect) onHabitSelect(nextId);
                     }}
                     activeOpacity={0.8}
                   >
                     <Text style={styles.habitPillEmoji}>{h.icon}</Text>
                     <Text style={[styles.habitPillText, { color: isSelected ? ringColor : theme.colors.textSecondary }]}>
                       {h.name}
                     </Text>
                   </TouchableOpacity>
                 );
               })}
            </ScrollView>
         </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly', 
    paddingVertical: 40,
    minHeight: '100%',
  },
  presetFloatingPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 30,
    padding: 6,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  presetItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroCenterpiece: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  heroRing: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 6,
    backgroundColor: 'rgba(20, 20, 25, 0.4)', // glass core
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Platform.select({ web: { backdropFilter: 'blur(20px)' }, default: {} }),
  },
  heroHalo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 20,
    zIndex: 1,
  },
  heroText: {
    fontSize: 84,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  heroSubText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  timeAdjustContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 6,
  },
  timeAdjustBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timeAdjustBtnText: {
    color: '#CCC',
    fontSize: 13,
    fontWeight: '700',
  },
  controlsLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  sideBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sideBtnIcon: {
    fontSize: 22,
    color: '#CCC',
  },
  centerPlayBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 36,
  },
  habitContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  habitHeadline: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 16,
  },
  habitScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  habitFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  habitPillEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  habitPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
