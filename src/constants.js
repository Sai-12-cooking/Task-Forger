export const Q_URGENT_IMPORTANT = 'ur_im';
export const Q_NOT_URGENT_IMPORTANT = 'nu_im';
export const Q_URGENT_NOT_IMPORTANT = 'ur_xu';
export const Q_NOT_URGENT_NOT_IMPORTANT = 'nu_xu';

export const CATEGORY_LABELS = {
  [Q_URGENT_IMPORTANT]: 'Important & Urgent',
  [Q_NOT_URGENT_IMPORTANT]: 'Important & Not Urgent',
  [Q_URGENT_NOT_IMPORTANT]: 'Not Important & Urgent',
  [Q_NOT_URGENT_NOT_IMPORTANT]: 'Not Important & Not Urgent',
};

export const TC_ALL        = 'all';
export const TC_ACADEMICS  = 'academics';
export const TC_WORK       = 'work';
export const TC_FITNESS    = 'fitness';
export const TC_PERSONAL   = 'personal';
export const TC_DAILY      = 'daily';
export const TC_OTHERS     = 'others';

export const TASK_CATEGORIES = [
  { id: TC_ACADEMICS, label: 'Academics', emoji: '🎓', color: '#4A9EFF' },
  { id: TC_WORK,      label: 'Work',      emoji: '💼', color: '#00CED1' },
  { id: TC_FITNESS,   label: 'Fitness',   emoji: '💪', color: '#4CAF50' },
  { id: TC_PERSONAL,  label: 'Personal',  emoji: '👤', color: '#FF6B9D' },
  { id: TC_DAILY,     label: 'Daily',     emoji: '🛒', color: '#FF9F43' },
  { id: TC_OTHERS,    label: 'Others',    emoji: '✨', color: '#888888' },
];

export const TASK_CATEGORY_MAP = Object.fromEntries(
  TASK_CATEGORIES.map(c => [c.id, c])
);

// ── Recurring types ────────────────────────────────────────────────
export const RECUR_NONE     = 'none';
export const RECUR_DAILY    = 'daily';
export const RECUR_WEEKLY   = 'weekly';
export const RECUR_WEEKDAYS = 'weekdays';
export const RECUR_MONTHLY  = 'monthly';

export const RECUR_OPTIONS = [
  { id: RECUR_NONE,     label: 'None' },
  { id: RECUR_DAILY,    label: 'Daily' },
  { id: RECUR_WEEKLY,   label: 'Weekly' },
  { id: RECUR_WEEKDAYS, label: 'Weekdays' },
  { id: RECUR_MONTHLY,  label: 'Monthly' },
];
