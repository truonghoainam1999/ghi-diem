import type { Game, PlayerId, Standing } from './types';

/** Hàm thuần — không đọc ngày giờ, không chạm state. Test được thẳng. */

export function scoreOf(game: Game, roundIndex: number, playerId: PlayerId): number {
  return game.rounds[roundIndex]?.scores[playerId] ?? 0;
}

export function totalFor(game: Game, playerId: PlayerId): number {
  return game.rounds.reduce((sum, round) => sum + (round.scores[playerId] ?? 0), 0);
}

export function totals(game: Game): Record<PlayerId, number> {
  const out: Record<PlayerId, number> = {};
  for (const player of game.players) out[player.id] = totalFor(game, player.id);
  return out;
}

/**
 * Xếp hạng theo chiều thắng của ván. Bằng điểm thì cùng hạng,
 * và hạng kế tiếp nhảy cóc (1, 2, 2, 4) đúng như cách xếp giải.
 */
export function standings(game: Game): Standing[] {
  const byId = totals(game);

  const sorted = [...game.players].sort((a, b) => {
    const diff = byId[b.id] - byId[a.id];
    return game.direction === 'high' ? diff : -diff;
  });

  const leaderTotal = sorted.length > 0 ? byId[sorted[0].id] : 0;

  let rank = 0;
  let previousTotal: number | null = null;

  return sorted.map((player, index) => {
    const total = byId[player.id];
    if (previousTotal === null || total !== previousTotal) rank = index + 1;
    previousTotal = total;

    return {
      player,
      total,
      rank,
      gapToLeader: game.direction === 'high' ? total - leaderTotal : leaderTotal - total,
    };
  });
}

/** null khi chưa có người chơi, hoặc khi nhiều người cùng dẫn đầu. */
export function leaderId(game: Game): PlayerId | null {
  const table = standings(game);
  if (table.length === 0) return null;
  const leaders = table.filter((row) => row.rank === 1);
  return leaders.length === 1 ? leaders[0].player.id : null;
}

/** Ván đã chạm điều kiện kết thúc chưa. Vẫn cần người dùng xác nhận. */
export function hasReachedEnd(game: Game): boolean {
  if (game.end.kind === 'manual') return false;
  if (game.end.kind === 'rounds') return game.rounds.length >= game.end.rounds;

  // Chạm mốc là dừng, bất kể ván tính điểm cao thắng hay thấp thắng:
  // ở game điểm thấp, người chạm mốc trước là người thua, ván vẫn dừng ở đó.
  const target = game.end.score;
  return game.players.some((player) => totalFor(game, player.id) >= target);
}

/** Số hiệu vòng sắp nhập, đếm từ 1. */
export function nextRoundNumber(game: Game): number {
  return game.rounds.length + 1;
}

/**
 * Điểm cộng dồn sau từng vòng, luôn bắt đầu từ 0.
 * Độ dài = số vòng + 1, phần tử đầu là mốc xuất phát trước khi chơi.
 */
export function cumulativeSeries(game: Game, playerId: PlayerId): number[] {
  const series = [0];
  for (const round of game.rounds) {
    series.push(series[series.length - 1] + (round.scores[playerId] ?? 0));
  }
  return series;
}

/** Số vòng gần nhất được xét khi đánh giá xu hướng. */
export const TREND_WINDOW = 10;

/** Ăn/thua quá mức này trong cửa sổ trên thì coi là đang lên hoặc đang xuống. */
export const TREND_THRESHOLD = 10;

export type Trend = 'rise' | 'flat' | 'fall';

/**
 * Tổng điểm ăn được trong tối đa TREND_WINDOW vòng gần nhất.
 * Ván chưa đủ số vòng thì lấy hết những gì đang có.
 */
export function recentSwing(game: Game, playerId: PlayerId, window = TREND_WINDOW): number {
  return game.rounds
    .slice(-window)
    .reduce((sum, round) => sum + (round.scores[playerId] ?? 0), 0);
}

/**
 * Đang lên, đang xuống, hay đi ngang.
 *
 * Cố ý không nhìn tổng điểm cả ván: một người đứng cuối bảng vẫn có thể đang
 * gỡ rất mạnh, và đó mới là thứ người ngồi bàn muốn biết.
 */
export function trendFor(
  game: Game,
  playerId: PlayerId,
  window = TREND_WINDOW,
  threshold = TREND_THRESHOLD,
): Trend {
  const swing = recentSwing(game, playerId, window);
  if (swing > threshold) return 'rise';
  if (swing < -threshold) return 'fall';
  return 'flat';
}

