import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { DEFAULT_THEME_MODE, loadThemeMode, saveThemeMode, type ThemeMode } from '@/storage/themeRepository';

import { makeTheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(makeTheme('dark'));

interface ThemeModeValue {
  mode: ThemeMode;
  /** Chuyển sang bước tiếp theo: tự động → sáng → tối → tự động. */
  cycleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeValue>({ mode: DEFAULT_THEME_MODE, cycleMode: () => {} });

const NEXT_MODE: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Khởi tạo bằng mặc định luôn, để không loé một nhịp giao diện sáng trong lúc đọc ổ đĩa.
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  useEffect(() => {
    let cancelled = false;
    loadThemeMode().then((stored) => {
      if (!cancelled) setMode(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cycleMode = useCallback(() => {
    setMode((current) => {
      const next = NEXT_MODE[current];
      void saveThemeMode(next);
      return next;
    });
  }, []);

  // 'auto' hỏi máy; hai giá trị kia bỏ qua máy, vì người dùng đã tự quyết.
  const scheme = mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const theme = useMemo(() => makeTheme(scheme), [scheme]);
  const modeValue = useMemo(() => ({ mode, cycleMode }), [mode, cycleMode]);

  return (
    <ThemeModeContext.Provider value={modeValue}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useThemeMode(): ThemeModeValue {
  return useContext(ThemeModeContext);
}

/**
 * Gói StyleSheet.create lại theo theme.
 *
 *   const useStyles = makeStyles((t) => ({
 *     box: { backgroundColor: t.color.surface },
 *   }));
 *
 *   function Box() {
 *     const s = useStyles();
 *     return <View style={s.box} />;
 *   }
 *
 * Style vẫn nằm cạnh component, nhưng đổi ngày/đêm là tự tính lại.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
