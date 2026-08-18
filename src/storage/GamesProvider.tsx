import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { createId } from '@/domain/id';
import { PLAYER_COLOR_COUNT } from '@/theme/tokens';
import type {
  EndCondition,
  Game,
  GameId,
  Player,
  PlayerDraft,
  PlayerId,
  RoundId,
  ScoreDirection,
} from '@/domain/types';

import { loadGames, saveGames } from './gamesRepository';

export interface NewGameInput {
  /** Không bắt buộc — bỏ trống thì ván gọi theo tên nhóm. */
  title?: string;
  players: PlayerDraft[];
  direction: ScoreDirection;
  end: EndCondition;
  zeroSum: boolean;
}

interface GamesContextValue {
  games: Game[];
  /** false trong lúc đọc từ ổ đĩa lần đầu — dùng để tránh nháy màn hình rỗng. */
  ready: boolean;
  activeGames: Game[];
  finishedGames: Game[];
  getGame: (id: GameId) => Game | undefined;
  createGame: (input: NewGameInput) => Game;
  addRound: (id: GameId, scores: Record<PlayerId, number>) => void;
  updateRoundScore: (id: GameId, roundId: RoundId, playerId: PlayerId, score: number) => void;
  undoLastRound: (id: GameId) => void;
  addPlayer: (id: GameId, name: string) => void;
  updatePlayer: (id: GameId, playerId: PlayerId, patch: PlayerDraft) => void;
  setShowTotals: (id: GameId, showTotals: boolean) => void;
  finishGame: (id: GameId) => void;
  reopenGame: (id: GameId) => void;
  deleteGame: (id: GameId) => void;
}

const GamesContext = createContext<GamesContextValue | null>(null);

function makePlayer(draft: PlayerDraft): Player {
  return {
    id: createId('p'),
    name: draft.name.trim(),
    colorIndex: draft.colorIndex % PLAYER_COLOR_COUNT,
    ...(draft.emoji ? { emoji: draft.emoji } : {}),
  };
}

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  // Không ghi đè ổ đĩa bằng danh sách rỗng trước khi đọc xong.
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGames().then((stored) => {
      if (cancelled) return;
      setGames(stored);
      loaded.current = true;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void saveGames(games);
  }, [games]);

  /** Sửa một ván tại chỗ, các ván khác giữ nguyên tham chiếu. */
  const patchGame = useCallback((id: GameId, patch: (game: Game) => Game) => {
    setGames((current) => current.map((game) => (game.id === id ? patch(game) : game)));
  }, []);

  const createGame = useCallback((input: NewGameInput): Game => {
    const title = input.title?.trim();
    const game: Game = {
      id: createId('g'),
      ...(title ? { title } : {}),
      players: input.players.filter((draft) => draft.name.trim().length > 0).map(makePlayer),
      rounds: [],
      direction: input.direction,
      end: input.end,
      zeroSum: input.zeroSum,
      createdAt: Date.now(),
      finishedAt: null,
    };
    setGames((current) => [game, ...current]);
    return game;
  }, []);

  const addRound = useCallback(
    (id: GameId, scores: Record<PlayerId, number>) => {
      patchGame(id, (game) => ({
        ...game,
        rounds: [...game.rounds, { id: createId('r'), scores, createdAt: Date.now() }],
      }));
    },
    [patchGame],
  );

  const updateRoundScore = useCallback(
    (id: GameId, roundId: RoundId, playerId: PlayerId, score: number) => {
      patchGame(id, (game) => ({
        ...game,
        rounds: game.rounds.map((round) =>
          round.id === roundId ? { ...round, scores: { ...round.scores, [playerId]: score } } : round,
        ),
      }));
    },
    [patchGame],
  );

  const undoLastRound = useCallback(
    (id: GameId) => {
      patchGame(id, (game) => ({ ...game, rounds: game.rounds.slice(0, -1) }));
    },
    [patchGame],
  );

  const addPlayer = useCallback(
    (id: GameId, name: string) => {
      patchGame(id, (game) => ({
        ...game,
        // Vào giữa ván thì các vòng trước tính 0 — không cần vá lại rounds.
        players: [...game.players, makePlayer({ name, colorIndex: game.players.length })],
      }));
    },
    [patchGame],
  );

  /** Đổi tên, màu, icon của một người đang trong ván. Điểm giữ nguyên vì khoá là id. */
  const updatePlayer = useCallback(
    (id: GameId, playerId: PlayerId, patch: PlayerDraft) => {
      patchGame(id, (game) => ({
        ...game,
        players: game.players.map((player) =>
          player.id === playerId
            ? {
                id: player.id,
                name: patch.name.trim() || player.name,
                colorIndex: patch.colorIndex % PLAYER_COLOR_COUNT,
                ...(patch.emoji ? { emoji: patch.emoji } : {}),
              }
            : player,
        ),
      }));
    },
    [patchGame],
  );

  /** Ẩn/hiện hàng tổng điểm. Chỉ đổi cách nhìn, không đụng gì tới điểm đã ghi. */
  const setShowTotals = useCallback(
    (id: GameId, showTotals: boolean) => patchGame(id, (game) => ({ ...game, showTotals })),
    [patchGame],
  );

  const finishGame = useCallback(
    (id: GameId) => patchGame(id, (game) => ({ ...game, finishedAt: Date.now() })),
    [patchGame],
  );

  const reopenGame = useCallback(
    (id: GameId) => patchGame(id, (game) => ({ ...game, finishedAt: null })),
    [patchGame],
  );

  const deleteGame = useCallback((id: GameId) => {
    setGames((current) => current.filter((game) => game.id !== id));
  }, []);

  const value = useMemo<GamesContextValue>(() => {
    const sorted = [...games].sort((a, b) => b.createdAt - a.createdAt);

    return {
      games: sorted,
      ready,
      activeGames: sorted.filter((game) => game.finishedAt === null),
      finishedGames: sorted.filter((game) => game.finishedAt !== null),
      getGame: (id) => games.find((game) => game.id === id),
      createGame,
      addRound,
      updateRoundScore,
      undoLastRound,
      addPlayer,
      updatePlayer,
      setShowTotals,
      finishGame,
      reopenGame,
      deleteGame,
    };
  }, [games, ready, createGame, addRound, updateRoundScore, undoLastRound, addPlayer, updatePlayer, setShowTotals, finishGame, reopenGame, deleteGame]);

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
}

export function useGames(): GamesContextValue {
  const value = useContext(GamesContext);
  if (!value) throw new Error('useGames phải nằm trong <GamesProvider>');
  return value;
}

/** Lấy đúng một ván. undefined khi id không tồn tại (ví dụ vừa bị xoá). */
export function useGame(id: GameId | undefined): Game | undefined {
  const { games } = useGames();
  return useMemo(() => games.find((game) => game.id === id), [games, id]);
}
