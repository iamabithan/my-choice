import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const THEME_MODE_KEY = 'my-choice-theme-mode';
const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_MODE_KEY)
      .then((storedMode) => {
        if (!isMounted) return;
        if (storedMode === 'light' || storedMode === 'dark') setMode(storedMode);
      })
      .catch(() => {
        // Keep the system-derived default if storage is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => {
          const nextMode = current === 'dark' ? 'light' : 'dark';
          AsyncStorage.setItem(THEME_MODE_KEY, nextMode).catch(() => {});
          return nextMode;
        });
      },
    }),
    [mode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider.');
  }
  return value;
}
