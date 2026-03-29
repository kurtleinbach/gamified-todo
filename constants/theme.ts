import { MD3DarkTheme } from 'react-native-paper';

export const Colors = {
  // Purples — accents only
  purple900: '#1E0A3C',
  purple800: '#2D1563',
  purple700: '#4C1D95',
  purple600: '#6D28D9',
  purple500: '#7C3AED',
  purple400: '#8B5CF6',
  purple300: '#A78BFA',
  purple200: '#C4B5FD',
  purple100: '#EDE9FE',

  // Blues — accents only
  blue900: '#0A1628',
  blue800: '#1E3A5F',
  blue700: '#1D4ED8',
  blue600: '#2563EB',
  blue500: '#3B82F6',
  blue400: '#60A5FA',
  blue300: '#93C5FD',
  blue200: '#BFDBFE',
  blue100: '#DBEAFE',

  // Neutral backgrounds — the main palette
  bg:       '#111214',
  surface:  '#18191C',
  card:     '#1F2023',
  cardAlt:  '#232528',
  border:   '#2A2C30',
  borderLight: '#363840',

  // Text
  textPrimary:   '#ECEEF2',
  textSecondary: '#9BA3AF',
  textMuted:     '#555D6B',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error:   '#EF4444',
  xp:      '#FACC15',
  coins:   '#FB923C',

  // Priority — kept vivid so they stand out on neutral backgrounds
  priorityLow:    '#22C55E',
  priorityMedium: '#3B82F6',
  priorityHigh:   '#F59E0B',
  priorityEpic:   '#A855F7',
};

export const AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:         Colors.purple500,
    secondary:       Colors.blue500,
    background:      Colors.bg,
    surface:         Colors.surface,
    surfaceVariant:  Colors.card,
    onBackground:    Colors.textPrimary,
    onSurface:       Colors.textPrimary,
    outline:         Colors.border,
    error:           Colors.error,
  },
};

export const PriorityMeta = {
  low:    { label: 'Low',    color: Colors.priorityLow,    xp: 10,  coins: 2  },
  medium: { label: 'Medium', color: Colors.priorityMedium, xp: 25,  coins: 5  },
  high:   { label: 'High',   color: Colors.priorityHigh,   xp: 50,  coins: 10 },
  epic:   { label: 'Epic',   color: Colors.priorityEpic,   xp: 100, coins: 20 },
} as const;
