import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadFocusSession, loadFocusStats, saveFocusStats } from '../utils/storage';
import { Q_URGENT_IMPORTANT } from '../constants';

export function useFocusTracking(tasks, habits) {
  const [focusMode, setFocusMode] = useState(false);
  const [focusStats, setFocusStats] = useState([]);
  const [activeFocusHabitId, setActiveFocusHabitId] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  // ── Load on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const session = await loadFocusSession();
      const stats = await loadFocusStats();
      setFocusStats(stats);
      if (session && session.endTime > Date.now()) {
        setFocusMode(true);
      }
    })();
  }, []);

  // ── Active task for Pomodoro (top Q1 incomplete task) ─────────────
  const activeTask = useMemo(
    () => tasks.find(t => t.category === Q_URGENT_IMPORTANT && !t.completed),
    [tasks]
  );

  // ── Focus stat calculations (memoized) ────────────────────────────
  const { todayFocusStr, todaySessionsCount, currentStreak, bestDayStr } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = focusStats.filter(
      s => new Date(s.timestamp).toISOString().split('T')[0] === todayStr && !s.isBreak
    );
    const todayDurationSecs = todayStats.reduce((sum, s) => sum + (s.durationSecs || 0), 0);
    const focusHours = Math.floor(todayDurationSecs / 3600);
    const focusMins = Math.floor((todayDurationSecs % 3600) / 60);
    let todayFocusStr = '';
    if (focusHours > 0) todayFocusStr += `${focusHours}h `;
    todayFocusStr += `${focusMins}m`;

    const todaySessionsCount = todayStats.length;

    // Streak calculation
    const allDays = [...new Set(
      focusStats.filter(s => !s.isBreak)
        .map(s => new Date(s.timestamp).toISOString().split('T')[0])
    )].sort();
    let currentStreak = 0;
    if (allDays.length > 0) {
      let streak = 0;
      const last = new Date(allDays[allDays.length - 1]);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = 1;
        for (let i = allDays.length - 2; i >= 0; i--) {
          const d1 = new Date(allDays[i]);
          const d2 = new Date(allDays[i + 1]);
          if (Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) === 1) streak++;
          else break;
        }
      }
      currentStreak = streak;
    }

    // Best day
    const dailyDurations = {};
    focusStats.filter(s => !s.isBreak).forEach(s => {
      const dStr = new Date(s.timestamp).toISOString().split('T')[0];
      dailyDurations[dStr] = (dailyDurations[dStr] || 0) + (s.durationSecs || 0);
    });
    let bestDaySecs = 0;
    Object.values(dailyDurations).forEach(v => {
      if (v > bestDaySecs) bestDaySecs = v;
    });
    const bestDayHours = Math.floor(bestDaySecs / 3600);
    const bestDayMins = Math.floor((bestDaySecs % 3600) / 60);
    let bestDayStr = '';
    if (bestDayHours > 0) bestDayStr += `${bestDayHours}h `;
    bestDayStr += `${bestDayMins}m`;
    if (bestDaySecs === 0) bestDayStr = '0m';

    return { todayFocusStr, todaySessionsCount, currentStreak, bestDayStr };
  }, [focusStats]);

  // ── Record a completed focus session ──────────────────────────────
  const recordFocusSession = useCallback((durationSecs) => {
    setFocusStats(prev => {
      const updated = [...prev, { timestamp: Date.now(), durationSecs, isBreak: false }];
      saveFocusStats(updated);
      return updated;
    });
  }, []);

  return {
    focusMode,
    setFocusMode,
    focusStats,
    activeFocusHabitId,
    setActiveFocusHabitId,
    timerActive,
    setTimerActive,
    activeTask,
    todayFocusStr,
    todaySessionsCount,
    currentStreak,
    bestDayStr,
    recordFocusSession,
  };
}
