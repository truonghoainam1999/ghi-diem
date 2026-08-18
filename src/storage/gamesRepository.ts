import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Game } from '@/domain/types';

/**
 * Toàn bộ dữ liệu nằm trong máy, không có tài khoản và không có mạng.
 * Ván bài rất nhẹ (vài chục vòng, vài người) nên ghi cả danh sách một lần
 * là đủ nhanh; khi nào dữ liệu lớn lên mới cần đổi sang expo-sqlite.
 */

const STORAGE_KEY = 'tinhdiem.games.v1';

export async function loadGames(): Promise<Game[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Game[]) : [];
  } catch {
    // Dữ liệu hỏng thì bắt đầu lại từ danh sách rỗng còn hơn là kẹt ở màn trắng.
    return [];
  }
}

export async function saveGames(games: Game[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export async function clearGames(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
