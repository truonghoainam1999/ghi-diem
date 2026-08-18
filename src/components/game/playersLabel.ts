import type { Game } from '@/domain/types';

/**
 * Tên hiển thị của một ván: tên người dùng đặt, nếu không đặt thì gọi theo
 * nhóm người ngồi bàn hôm đó — thứ duy nhất còn lại để nhận ra buổi chơi.
 */
export function gameLabel(game: Game, max = 3): string {
  return game.title?.trim() || playersLabel(game, max);
}

/** Tên nhóm người chơi, luôn theo người chứ không theo tên ván. */
export function playersLabel(game: Game, max = 3): string {
  if (game.players.length === 0) return 'Ván trống';

  const shown = game.players.slice(0, max).map((player) => player.name);
  const hidden = game.players.length - shown.length;
  return hidden > 0 ? `${shown.join(', ')} +${hidden}` : shown.join(', ');
}
