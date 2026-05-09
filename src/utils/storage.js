import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@tasks_v1';
const HABITS_KEY = '@habits_v1';
const HABIT_LOGS_KEY = '@habit_logs_v1';

export const saveTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving tasks to AsyncStorage', e);
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading tasks from AsyncStorage', e);
    return [];
  }
};

export const saveHabits = async (habits) => {
  try {
    const jsonValue = JSON.stringify(habits);
    await AsyncStorage.setItem(HABITS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving habits to AsyncStorage', e);
  }
};

export const loadHabits = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HABITS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading habits from AsyncStorage', e);
    return [];
  }
};

export const saveHabitLogs = async (logs) => {
  try {
    // 60 day rolling truncation
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    const prunedLogs = logs.filter(log => log.date >= cutoffString);

    const jsonValue = JSON.stringify(prunedLogs);
    await AsyncStorage.setItem(HABIT_LOGS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving habit logs', e);
  }
};

export const loadHabitLogs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HABIT_LOGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading habit logs', e);
    return [];
  }
};

const ONBOARDING_KEY = '@onboarding_v1';
const SETTINGS_KEY = '@productivity_settings_v1';
const FOCUS_SESSION_KEY = '@focus_session_v1';

export const saveOnboardingStatus = async (status) => {
  try { await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(status)); } catch (e) {}
};
export const loadOnboardingStatus = async () => {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val !== null ? JSON.parse(val) : false;
  } catch (e) { return false; }
};

export const saveProductivitySettings = async (settings) => {
  try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
};
export const loadProductivitySettings = async () => {
  try {
    const val = await AsyncStorage.getItem(SETTINGS_KEY);
    return val !== null ? JSON.parse(val) : { requireFocusLock: true };
  } catch (e) { return { requireFocusLock: true }; }
};

export const saveFocusSession = async (session) => {
  try { await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session)); } catch (e) {}
};
export const loadFocusSession = async () => {
  try {
    const val = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
    return val !== null ? JSON.parse(val) : null;
  } catch (e) { return null; }
};
export const clearFocusSession = async () => {
  try { await AsyncStorage.removeItem(FOCUS_SESSION_KEY); } catch (e) {}
};

const FOCUS_STATS_KEY = '@focus_stats_v1';
export const saveFocusStats = async (stats) => {
  try { 
    // truncate to last 90 days to save space
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffMs = cutoffDate.getTime();
    const pruned = stats.filter(s => s.timestamp >= cutoffMs);
    await AsyncStorage.setItem(FOCUS_STATS_KEY, JSON.stringify(pruned)); 
  } catch (e) {}
};
export const loadFocusStats = async () => {
  try {
    const val = await AsyncStorage.getItem(FOCUS_STATS_KEY);
    return val !== null ? JSON.parse(val) : [];
  } catch (e) { return []; }
};
