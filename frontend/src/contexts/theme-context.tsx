import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  scheme: ColorScheme;
  toggleScheme: () => void;
  setScheme: (scheme: ColorScheme) => void;
}

const STORAGE_KEY = 'clearway-color-scheme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [savedScheme, setSavedScheme] = useState<ColorScheme | null>(null);
  const changedByUser = useRef(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && !changedByUser.current && (stored === 'light' || stored === 'dark')) {
          setSavedScheme(stored);
        }
      })
      .catch((error) => console.warn('Could not load color scheme:', error));
    return () => { active = false; };
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    changedByUser.current = true;
    setSavedScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next)
      .catch((error) => console.warn('Could not save color scheme:', error));
  }, []);

  const scheme: ColorScheme = savedScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const toggleScheme = useCallback(() => setScheme(scheme === 'dark' ? 'light' : 'dark'), [scheme, setScheme]);
  const value = useMemo(() => ({ scheme, setScheme, toggleScheme }), [scheme, setScheme, toggleScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
