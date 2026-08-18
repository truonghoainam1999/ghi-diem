/** Mô hình dữ liệu của app. Không phụ thuộc React hay React Native. */

export type PlayerId = string;
export type GameId = string;
export type RoundId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Chỉ số vào bảng màu người chơi. Gán tự động theo thứ tự, người dùng đổi được. */
  colorIndex: number;
  /** Emoji thay cho chữ cái đầu trong avatar. Bỏ trống thì dùng chữ cái. */
  emoji?: string;
}

/** Người chơi lúc đang dựng ván, chưa có id. */
export interface PlayerDraft {
  name: string;
  colorIndex: number;
  emoji?: string;
}

/** Điểm cao thắng hay điểm thấp thắng. Chỉ đổi chiều xếp hạng, không đổi cách tính. */
export type ScoreDirection = 'high' | 'low';

export type EndCondition =
  | { kind: 'manual' }
  | { kind: 'rounds'; rounds: number }
  | { kind: 'target'; score: number };

export interface Round {
  id: RoundId;
  /** Điểm theo playerId. Thiếu khoá nào thì người đó tính 0 vòng đó. */
  scores: Record<PlayerId, number>;
  createdAt: number;
}

export interface Game {
  id: GameId;
  /** Tên ván do người dùng đặt. Bỏ trống thì ván gọi theo tên nhóm người chơi. */
  title?: string;
  players: Player[];
  rounds: Round[];
  direction: ScoreDirection;
  end: EndCondition;
  /**
   * Điểm mỗi vòng của cả bàn phải cộng lại bằng 0 — ai được thì người khác mất.
   * Khi bật, người cuối cùng chưa nhập được tự điền cho đủ 0.
   */
  zeroSum: boolean;
  /**
   * Hiện hàng tổng điểm phía trên lưới vòng. Bỏ trống coi như bật —
   * ván lưu từ trước khi có tuỳ chọn này vẫn hiện như cũ.
   */
  showTotals?: boolean;
  createdAt: number;
  /** null nghĩa là đang chơi. Kết thúc nhầm thì mở khoá lại được. */
  finishedAt: number | null;
}

export interface Standing {
  player: Player;
  total: number;
  /** Bắt đầu từ 1. Bằng điểm thì cùng hạng. */
  rank: number;
  /** Khoảng cách tới người dẫn đầu, luôn ≤ 0. Người dẫn đầu là 0. */
  gapToLeader: number;
}
