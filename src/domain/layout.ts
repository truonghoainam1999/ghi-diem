/**
 * Bảng điểm phải chứa 5 người trên màn 390pt mà không cuộn ngang — ràng buộc
 * gốc của thiết kế. Toàn bộ phép tính bề rộng cột nằm ở đây, không rải ra
 * component, để đổi ngưỡng thì chỉ sửa một chỗ.
 */

/** Bề rộng cột "Vòng" bên trái. */
export const ROUND_COL = 34;

/** Cột người chơi hẹp hơn ngưỡng này thì bảng chuyển sang cuộn ngang. */
export const MIN_PLAYER_COL = 44;

export function playerColumnWidth(playerCount: number, screenWidth: number): number {
  if (playerCount <= 0) return MIN_PLAYER_COL;
  const available = screenWidth - ROUND_COL;
  return Math.max(MIN_PLAYER_COL, available / playerCount);
}

export function needsHorizontalScroll(playerCount: number, screenWidth: number): boolean {
  if (playerCount <= 0) return false;
  return (screenWidth - ROUND_COL) / playerCount < MIN_PLAYER_COL;
}

/** Cỡ chữ tổng điểm co lại khi bàn đông người, để số ba chữ số vẫn vừa cột. */
export function scoreFontSize(playerCount: number): number {
  if (playerCount <= 5) return 23;
  if (playerCount <= 7) return 20;
  return 17;
}

/** Dấu trừ U+2212 — rộng bằng chữ số nên cột vẫn thẳng hàng. */
export const MINUS = '−';

export function formatScore(value: number): string {
  return value < 0 ? MINUS + Math.abs(value) : String(value);
}

/** Có dấu cộng ở số dương, dùng cho cột chênh lệch. */
export function formatDelta(value: number): string {
  if (value === 0) return '0';
  return value < 0 ? MINUS + Math.abs(value) : `+${value}`;
}
