import { useState, useEffect, useCallback } from 'react';
import { loadHabits, saveHabits, loadHabitLogs, saveHabitLogs } from '../utils/storage';
import { triggerConfetti } from '../utils/confetti';

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);

  // ── Load on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const savedHabits = await loadHabits();
      const savedLogs = await loadHabitLogs();
      setHabits(savedHabits);
      setLogs(savedLogs);
    })();
  }, []);

  // ── Toggle habit completion ───────────────────────────────────────
  // Uses functional updater to avoid stale closure over `logs`.
  const handleToggleHabit = useCallback((habit) => {
    setLogs(prev => {
      const todayStr = new Date().toISOString().split('T')[0];
      const logIndex = prev.findIndex(l => l.habitId === habit.id && l.date === todayStr);
      const nextLogs = [...prev];

      if (logIndex >= 0) {
        if (nextLogs[logIndex].completed) {
          nextLogs[logIndex] = { ...nextLogs[logIndex], completed: false, completedAt: null };
        } else {
          nextLogs[logIndex] = { ...nextLogs[logIndex], completed: true, completedAt: Math.floor(Date.now() / 1000) };
          triggerConfetti();
        }
      } else {
        nextLogs.push({
          habitId: habit.id,
          date: todayStr,
          completed: true,
          completedAt: Math.floor(Date.now() / 1000),
        });
        triggerConfetti();
      }
      saveHabitLogs(nextLogs);
      return nextLogs;
    });
  }, []);

  // ── Auto-complete a habit via Pomodoro ────────────────────────────
  const autoCompleteHabit = useCallback(async (habitId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setLogs(prev => {
      const logIndex = prev.findIndex(l => l.habitId === habitId && l.date === todayStr);
      let nextLogs = [...prev];
      if (logIndex >= 0) {
        if (!nextLogs[logIndex].completed) {
          nextLogs[logIndex].completed = true;
          nextLogs[logIndex].completedAt = Math.floor(Date.now() / 1000);
        }
      } else {
        nextLogs.push({
          habitId,
          date: todayStr,
          completed: true,
          completedAt: Math.floor(Date.now() / 1000),
        });
      }
      saveHabitLogs(nextLogs);
      return nextLogs;
    });
    triggerConfetti();
  }, []);

  return {
    habits,
    setHabits,
    logs,
    setLogs,
    handleToggleHabit,
    autoCompleteHabit,
  };
}
