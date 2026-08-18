import type { PlayerId } from './types';

/**
 * Luật "tổng bằng 0": điểm cả bàn trong một vòng phải cộng lại bằng 0,
 * ai được thì người khác mất đúng bấy nhiêu.
 *
 * App chỉ điền hộ đúng một người: người cuối cùng chưa ai chạm tới. Khi người
 * dùng đã tự tay chỉnh cả bàn thì app không đoán thay nữa — sửa số của người
 * này mà lặng lẽ đổi số của người kia là hành vi khó lường. Lúc đó chỉ báo đỏ
 * cho biết vòng chưa cân, để người dùng tự quyết ai chịu phần lệch.
 *
 * Hàm thuần, không biết gì về React — toàn bộ phần khó của tính năng nằm ở đây.
 */

export function sumScores(playerIds: readonly PlayerId[], scores: Record<PlayerId, number>): number {
  return playerIds.reduce((total, id) => total + (scores[id] ?? 0), 0);
}

/**
 * Người được app điền hộ: người duy nhất chưa nhập tay.
 *
 * - Còn từ hai người chưa nhập: chưa đủ dữ kiện, không suy ra được ai gánh.
 * - Còn đúng một người: chính người đó, và vẫn tính lại mỗi lần người khác đổi số.
 * - Cả bàn đã nhập tay: không ai cả, để người dùng tự cân.
 */
export function balancingPlayer(
  playerIds: readonly PlayerId[],
  edited: ReadonlySet<PlayerId>,
): PlayerId | null {
  const untouched = playerIds.filter((id) => !edited.has(id));
  return untouched.length === 1 ? untouched[0] : null;
}

/**
 * Điền cho người gánh đúng số làm cả vòng thành 0.
 * Không có ai gánh thì trả về nguyên bản, không đụng gì.
 */
export function applyZeroSum(
  playerIds: readonly PlayerId[],
  scores: Record<PlayerId, number>,
  edited: ReadonlySet<PlayerId>,
): Record<PlayerId, number> {
  const target = balancingPlayer(playerIds, edited);
  if (target === null) return scores;

  const others = playerIds.filter((id) => id !== target);
  return { ...scores, [target]: -sumScores(others, scores) };
}
