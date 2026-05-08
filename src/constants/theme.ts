export const DarkTheme = {
  isDark: true,
  admin: '#FF4D4D',
  manager: '#FFB830',
  marketing: '#00E5A0',
  receptionist: '#00B4FF',
  videographer: '#A855F7',
  editor: '#F97316',
  client: '#E2E2E2',
  background: '#070709',
  surface: '#0e0e12',
  surfaceLight: '#16161d',
  border: '#1e1e26',
  text: '#e8e8e8',
  textDim: '#888',
  textDark: '#666',
  success: '#4ade80',
  error: '#f87171',
  warning: '#fb923c',
  info: '#60a5fa',
};

export const LightTheme = {
  isDark: false,
  admin: '#E11D48',
  manager: '#D97706',
  marketing: '#059669',
  receptionist: '#0284C7',
  videographer: '#7C3AED',
  editor: '#EA580C',
  client: '#475569',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textDim: '#64748B',
  textDark: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const Colors = DarkTheme; // Default to Dark for "Elite" feel

import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useSettingsStore();

  if (themeMode === 'light') return LightTheme;
  if (themeMode === 'dark') return DarkTheme;
  
  return systemColorScheme === 'light' ? LightTheme : DarkTheme;
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  full: 999,
};
