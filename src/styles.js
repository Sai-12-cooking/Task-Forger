import { StyleSheet } from 'react-native';

// ─── Theme Color Palettes ────────────────────────────────────────────
const MIDNIGHT_COLORS = {
  background:       '#0D0D0F',
  surface:          '#1A1A1F',
  surfaceHighlight: '#252530',
  primary:          '#BB86FC',
  secondary:        '#03DAC6',
  error:            '#CF6679',
  text:             '#F0F0F5',
  textSecondary:    '#9090A8',
  q1: '#FF5252',
  q2: '#FF4081',
  q3: '#FFB142',
  q4: '#7C4DFF',
};

const DEEPBLUE_COLORS = {
  background:       '#050D1A',
  surface:          '#0D1F3C',
  surfaceHighlight: '#14305A',
  primary:          '#4A9EFF',
  secondary:        '#00E5FF',
  error:            '#FF6B6B',
  text:             '#E8F4FF',
  textSecondary:    '#7BA8CC',
  q1: '#FF5252',
  q2: '#FF4081',
  q3: '#FFB142',
  q4: '#4A9EFF',
};

const EMERALD_COLORS = {
  background:       '#060F0A',
  surface:          '#0E1F17',
  surfaceHighlight: '#162D22',
  primary:          '#00C896',
  secondary:        '#64FFDA',
  error:            '#FF6B6B',
  text:             '#E0F5EE',
  textSecondary:    '#6BAF8F',
  q1: '#FF5252',
  q2: '#FF4081',
  q3: '#FFB142',
  q4: '#00C896',
};

const LIGHT_COLORS = {
  background:       '#F5F5F7',
  surface:          '#FFFFFF',
  surfaceHighlight: '#EBEBF0',
  primary:          '#6200EE',
  secondary:        '#03DAC6',
  error:            '#B00020',
  text:             '#1A1A1A',
  textSecondary:    '#666680',
  q1: '#D32F2F',
  q2: '#C2185B',
  q3: '#F57C00',
  q4: '#512DA8',
};

// ─── Common spacing + radii ──────────────────────────────────────────
const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const RADII   = { s: 4, m: 8, l: 16, xl: 24 };

// Helper to build a full backward-compatible theme object
function buildTheme(colors) {
  return {
    colors,          // theme.colors.background  (old pattern)
    spacing: SPACING, // theme.spacing.m
    radii: RADII,     // theme.radii.l
    // flat shortcuts for newer component code
    ...colors,
  };
}

// ─── 4 Exported Theme Presets ────────────────────────────────────────
export const THEMES = {
  midnight: { id: 'midnight', label: 'Midnight', swatch: '#BB86FC', ...buildTheme(MIDNIGHT_COLORS) },
  deepblue: { id: 'deepblue', label: 'Deep Blue', swatch: '#4A9EFF', ...buildTheme(DEEPBLUE_COLORS) },
  emerald:  { id: 'emerald',  label: 'Emerald',   swatch: '#00C896', ...buildTheme(EMERALD_COLORS)  },
  light:    { id: 'light',    label: 'Light',      swatch: '#6200EE', ...buildTheme(LIGHT_COLORS)    },
};

export const DEFAULT_THEME_ID = 'midnight';

// ─── Default export for static imports (backward compat) ─────────────
// Components that do `import { theme } from '../styles'` get midnight.
export const theme = THEMES.midnight;

export const globalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MIDNIGHT_COLORS.background },
});
