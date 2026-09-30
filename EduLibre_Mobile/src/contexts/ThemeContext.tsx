import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';

type ThemeName = 'light' | 'dark';

const palettes = {
  light: {
    background: '#eef4fc',
    surface: '#ffffff',
    text: '#152c4c',
    mutedText: '#52657d',
    border: '#c4d6ed',
    primary: '#2563eb',
    danger: '#b42318',
    onPrimary: '#ffffff',
  },

  dark: {
    background: '#0a152a',
    surface: '#14243e',
    text: '#edf2fa',
    mutedText: '#b5c6dc',
    border: '#3b587c',
    primary: '#4672ff',
    danger: '#ffb4ab',
    onPrimary: '#ffffff',
  },
};

type ThemeContextValue = {
  theme: ThemeName;
  colors: (typeof palettes)[ThemeName];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme();
  const theme: ThemeName = systemTheme === 'dark' ? 'dark' : 'light';

  const value = useMemo(
    () => ({
      theme,
      colors: palettes[theme],
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
  }

  return context;
}