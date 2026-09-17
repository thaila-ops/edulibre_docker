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
    background: '#fffaf4',
    surface: '#ffffff',
    text: '#1f2a44',
    mutedText: '#5f6572',
    border: '#dbcdbd',
    primary: '#b75c29',
    danger: '#b42318',
    onPrimary: '#ffffff',
  },
  dark: {
    background: '#121417',
    surface: '#1d2127',
    text: '#f5ede5',
    mutedText: '#c0c5ce',
    border: '#3b414b',
    primary: '#e79a67',
    danger: '#ffb4ab',
    onPrimary: '#121417',
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