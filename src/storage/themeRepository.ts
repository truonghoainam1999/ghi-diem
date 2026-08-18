import AsyncStorage from '@react-native-async-storage/async-storage';

/** 'auto' đi theo cài đặt của máy; hai giá trị còn lại là người dùng tự chọn. */
export type ThemeMode = 'auto' | 'light' | 'dark';

/**
 * Chưa chọn gì thì dùng giao diện tối, không đi theo máy. App này hay được mở
 * lúc đang ngồi chơi bài buổi tối, và màn hình sáng chói giữa bàn thì chói mắt
 * cả bàn chứ không riêng người cầm máy.
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

const STORAGE_KEY = 'tinhdiem.theme.v1';

const isMode = (value: unknown): value is ThemeMode =>
  value === 'auto' || value === 'light' || value === 'dark';

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return isMode(stored) ? stored : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, mode);
}
