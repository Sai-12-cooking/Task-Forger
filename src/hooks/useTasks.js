import { useState, useEffect, useCallback } from 'react';
import { saveTasks, loadTasks } from '../utils/storage';
import { cancelReminder, scheduleTaskReminder } from '../utils/notifications';
import { shiftTasks } from '../utils/taskShifter';
import { triggerConfetti } from '../utils/confetti';
import { RECUR_NONE } from '../constants';
import uuid from 'react-native-uuid';

// ── Recurring helper ──────────────────────────────────────────────────
function getNextDueDate(dueDateSeconds, recurringType) {
  if (!dueDateSeconds || !recurringType || recurringType === RECUR_NONE) return null;
  const d = new Date(dueDateSeconds * 1000);
  switch (recurringType) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'weekdays': {
      // Advance to the next weekday (Mon-Fri)
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
      break;
    }
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    default:
      return null;
  }
  return Math.floor(d.getTime() / 1000);
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // ── Load tasks on mount ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const saved = await loadTasks();
      setTasks(saved);
    })();
  }, []);

  // ── Task shifter (runs every 60s) ─────────────────────────────────
  // Note: no manual saveTasks() here — the auto-save effect below handles it.
  useEffect(() => {
    const shift = () => setTasks(prev => {
      const { updatedTasks, hasChanges } = shiftTasks(prev);
      return hasChanges ? updatedTasks : prev;
    });
    shift();
    const id = setInterval(shift, 60000);
    return () => clearInterval(id);
  }, []);

  // ── Auto-save ─────────────────────────────────────────────────────
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSaveTask = useCallback(async (taskData) => {
    if (editingTask) {
      if (editingTask.notificationId && editingTask.notificationId !== taskData.notificationId) {
        cancelReminder(editingTask.notificationId);
      }
      setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
    } else {
      setTasks(prev => [...prev, taskData]);
    }
  }, [editingTask]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
  }, []);

  const handleCompleteTask = useCallback((taskId) => {
    triggerConfetti();
    setTasks(prev => {
      let spawned = null;
      const updated = prev.map(t => {
        if (t.id === taskId) {
          if (t.notificationId) cancelReminder(t.notificationId);
          // Spawn next recurring instance if applicable
          if (t.recurringType && t.recurringType !== RECUR_NONE) {
            const nextDue = getNextDueDate(t.dueDateSeconds, t.recurringType);
            if (nextDue) {
              spawned = {
                ...t,
                id: uuid.v4(),
                completed: false,
                completedAt: null,
                dueDateSeconds: nextDue,
                notificationId: null,
                reminderEnabled: t.reminderEnabled ?? false,
                shifted: false,
                createdAt: Math.floor(Date.now() / 1000),
              };
              // Schedule reminder for new recurring instance
              if (spawned.reminderEnabled) {
                scheduleTaskReminder(spawned.name, nextDue).then(notifId => {
                  if (notifId) {
                    setTasks(curr => curr.map(ct =>
                      ct.id === spawned.id ? { ...ct, notificationId: notifId } : ct
                    ));
                  }
                });
              }
            }
          }
          return { ...t, completed: true, completedAt: Math.floor(Date.now() / 1000) };
        }
        return t;
      });
      return spawned ? [...updated, spawned] : updated;
    });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => {
      if (t.id === taskId && t.notificationId) cancelReminder(t.notificationId);
      return t.id !== taskId;
    }));
  }, []);

  const handleMoveTask = useCallback((taskId, newQuadrant) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, category: newQuadrant, shifted: false } : t
    ));
  }, []);

  return {
    tasks,
    editingTask,
    setEditingTask,
    handleSaveTask,
    handleEditTask,
    handleCompleteTask,
    handleDeleteTask,
    handleMoveTask,
  };
}

