import { Platform } from 'react-native';

// ── Web reminder tracking ─────────────────────────────────────────────
// Maps notificationId → setTimeout handle for cancellation on web
const _webTimers = {};

// ── Native setup (only import expo-notifications on native) ──────────
let Notifications = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────
function computeDelayMs(dueDateSeconds) {
  const now = Date.now();
  const dueDateMs = dueDateSeconds * 1000;
  // 15 minutes before due
  const reminderMs = dueDateMs - 15 * 60 * 1000;

  if (reminderMs > now) return reminderMs - now;
  if (dueDateMs > now) return dueDateMs - now;
  return 0; // already past → fire immediately
}

// ── Web: Browser Notification API + setTimeout ───────────────────────
async function scheduleWebReminder(taskName, dueDateSeconds) {
  try {
    // Request permission via browser Notification API
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        console.warn('Browser notification permission not granted');
        // Still return an ID so the "reminder enabled" state persists
      }
    }

    const id = 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const delayMs = computeDelayMs(dueDateSeconds);

    const timer = setTimeout(() => {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Task Reminder', {
            body: `Your task "${taskName}" is due soon!`,
            icon: '📋',
          });
        }
      } catch (_) {
        // Silently ignore if Notification constructor fails
      }
      delete _webTimers[id];
    }, delayMs);

    _webTimers[id] = timer;
    return id;
  } catch (e) {
    console.error('Error scheduling web notification', e);
    // Return a fallback ID so the reminder state is saved
    return 'web_fallback_' + Date.now();
  }
}

function cancelWebReminder(notificationId) {
  if (notificationId && _webTimers[notificationId]) {
    clearTimeout(_webTimers[notificationId]);
    delete _webTimers[notificationId];
  }
}

// ── Native: expo-notifications ───────────────────────────────────────
async function scheduleNativeReminder(taskName, dueDateSeconds) {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted!');
      return null;
    }

    const delayMs = computeDelayMs(dueDateSeconds);
    const secondsUntil = Math.max(1, Math.floor(delayMs / 1000));

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Your task "${taskName}" is due soon!`,
        sound: true,
      },
      trigger: delayMs === 0 ? null : { seconds: secondsUntil },
    });
    return id;
  } catch (e) {
    console.error('Error scheduling notification', e);
    return null;
  }
}

async function cancelNativeReminder(notificationId) {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.error('Error canceling notification', e);
    }
  }
}

// ── Public API (platform-aware) ──────────────────────────────────────
export const scheduleTaskReminder = async (taskName, dueDateSeconds) => {
  if (Platform.OS === 'web') {
    return scheduleWebReminder(taskName, dueDateSeconds);
  }
  return scheduleNativeReminder(taskName, dueDateSeconds);
};

export const cancelReminder = async (notificationId) => {
  if (!notificationId) return;
  if (Platform.OS === 'web') {
    cancelWebReminder(notificationId);
  } else {
    await cancelNativeReminder(notificationId);
  }
};
