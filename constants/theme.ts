import { useColorScheme } from 'react-native';

export const colorsLight = {
  primary: {
    50: '#F3F1FF',
    100: '#E6E1FF',
    200: '#CEC4FF',
    300: '#B0A0FF',
    400: '#8D74FF',
    500: '#6F52EE',
    600: '#5A3FD4',
    700: '#4930AD',
    800: '#392685',
    900: '#2B1D65',
  },

  accent: {
    50: '#FFF4EE',
    100: '#FFE4D4',
    200: '#FFC7A3',
    300: '#FFA573',
    400: '#FF8445',
    500: '#F26A2E',
    600: '#D1521D',
    700: '#A63F14',
  },

  semantic: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    error: '#DC2626',
    errorBg: '#FEE2E2',
    info: '#2563EB',
    infoBg: '#DBEAFE',
  },

  bg: {
    screen: '#FAFAF7',
    card: '#FFFFFF',
    surface: '#F5F5F2',
    input: '#F5F5F2',
    modal: '#FFFFFF',
    overlay: 'rgba(15, 14, 23, 0.5)',
  },

  text: {
    primary: '#1A1725',
    secondary: '#55516A',
    muted: '#8B879D',
    placeholder: '#B4B1C2',
    inverse: '#FFFFFF',
    link: '#6F52EE',
  },

  border: {
    light: '#ECEAE3',
    medium: '#D8D5CC',
    strong: '#B4B1C2',
  },

  occasion: {
    birthday: '#F26A2E',
    anniversary: '#E11D9E',
    christmas: '#16A34A',
    valentines: '#DC2626',
    mothers_day: '#EC4899',
    fathers_day: '#2563EB',
    custom: '#8B879D',
  },

  budget: {
    under: '#16A34A',
    onTrack: '#6F52EE',
    over: '#D97706',
  },

  countdown: {
    far: '#8B879D',
    near: '#6F52EE',
    soon: '#F26A2E',
    imminent: '#DC2626',
  },

  direction: {
    given: '#6F52EE',
    givenBg: '#F3F1FF',
    received: '#16A34A',
    receivedBg: '#DCFCE7',
  },
};

export const colorsDark = {
  primary: {
    50: '#1E1A3D',
    100: '#272252',
    200: '#332D6E',
    300: '#4A3F95',
    400: '#6B54C7',
    500: '#8D74FF',
    600: '#A090FF',
    700: '#B8ADFF',
    800: '#D0C9FF',
    900: '#E6E1FF',
  },

  accent: {
    50: '#3D1F0F',
    100: '#5C2E14',
    200: '#7A3C1A',
    300: '#A66035',
    400: '#D18458',
    500: '#FF9D6F',
    600: '#FFB890',
    700: '#FFD1B5',
  },

  semantic: {
    success: '#4ADE80',
    successBg: '#14532D',
    warning: '#FBBF24',
    warningBg: '#78350F',
    error: '#F87171',
    errorBg: '#7F1D1D',
    info: '#60A5FA',
    infoBg: '#1E3A8A',
  },

  bg: {
    screen: '#0F0E17',
    card: '#1A1825',
    surface: '#252234',
    input: '#252234',
    modal: '#1A1825',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: '#F4F3F8',
    secondary: '#B4B1C2',
    muted: '#8B879D',
    placeholder: '#5D5972',
    inverse: '#1A1725',
    link: '#8D74FF',
  },

  border: {
    light: '#2A2738',
    medium: '#3D3A52',
    strong: '#5D5972',
  },

  occasion: {
    birthday: '#FF9D6F',
    anniversary: '#F472B6',
    christmas: '#4ADE80',
    valentines: '#F87171',
    mothers_day: '#F9A8D4',
    fathers_day: '#60A5FA',
    custom: '#B4B1C2',
  },

  budget: {
    under: '#4ADE80',
    onTrack: '#8D74FF',
    over: '#FBBF24',
  },

  countdown: {
    far: '#8B879D',
    near: '#8D74FF',
    soon: '#FF9D6F',
    imminent: '#F87171',
  },

  direction: {
    given: '#8D74FF',
    givenBg: '#272252',
    received: '#4ADE80',
    receivedBg: '#14532D',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fab: {
    shadowColor: '#6F52EE',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
} as const;

export type Colors = typeof colorsLight;

export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? colorsDark : colorsLight;
  return { colors, spacing, radius, shadow, isDark: scheme === 'dark' };
}
