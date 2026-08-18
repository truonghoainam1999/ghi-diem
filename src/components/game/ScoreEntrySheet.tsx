import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { formatScore } from '@/domain/layout';
import { applyZeroSum, balancingPlayer, sumScores } from '@/domain/zeroSum';
import { makeStyles } from '@/theme/ThemeProvider';
import type { Game, PlayerId } from '@/domain/types';

import { PlayerAvatar, usePlayerColor } from './PlayerAvatar';

const useStyles = makeStyles((t) => ({
  scrollArea: { flex: 1 },
  /** Khối đầu sheet: tiêu đề + tổng vòng, ngăn với danh sách bằng một đường kẻ. */
  headerBlock: {
    gap: t.space.sm + 2,
    paddingBottom: t.space.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: t.color.line,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  /** Hai bên rộng bằng nhau thì tiêu đề mới nằm giữa thật. */
  headSide: { minWidth: 76 },
  headSideRight: { minWidth: 76, alignItems: 'flex-end' },
  headTitle: { flex: 1, textAlign: 'center' },
  list: { gap: t.space.md - 1, paddingTop: t.space.xs + 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.space.sm,
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.button,
    paddingVertical: t.space.sm,
    paddingLeft: t.space.md,
    paddingRight: t.space.sm + 2,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2, flex: 1 },
  zeroBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
}));

export interface ScoreEntrySheetProps {
  game: Game;
  visible: boolean;
  title: string;
  saveLabel: string;
  /** Điểm mở sẵn khi sửa một vòng đã có. Bỏ trống thì tất cả bắt đầu từ 0. */
  initialScores?: Record<PlayerId, number>;
  /** Người đang được nhắm tới — viền theo màu người chơi để bàn phím che tên vẫn biết đang nhập cho ai. */
  focusPlayerId?: PlayerId;
  onCancel: () => void;
  onSave: (scores: Record<PlayerId, number>) => void;
}

/**
 * Thao tác lặp nhiều nhất trong app. Bottom sheet đè lên bảng điểm chứ không
 * mở màn mới, để tổng điểm vẫn thấy phía sau.
 */
export function ScoreEntrySheet({
  game,
  visible,
  title,
  saveLabel,
  initialScores,
  focusPlayerId,
  onCancel,
  onSave,
}: ScoreEntrySheetProps) {
  const styles = useStyles();
  const [scores, setScores] = useState<Record<PlayerId, number>>({});

  // Ai đã tự tay nhập. Còn đúng một người ngoài danh sách này thì app điền hộ.
  const [edited, setEdited] = useState<ReadonlySet<PlayerId>>(new Set());

  const playerIds = game.players.map((player) => player.id);
  const autoId = game.zeroSum ? balancingPlayer(playerIds, edited) : null;
  const total = sumScores(playerIds, scores);
  const balanced = !game.zeroSum || total === 0;

  // Mở lại là reset — không mang điểm của vòng trước sang vòng sau.
  useEffect(() => {
    if (!visible) return;
    const next: Record<PlayerId, number> = {};
    for (const player of game.players) next[player.id] = initialScores?.[player.id] ?? 0;
    setScores(next);
    setEdited(new Set());
  }, [visible, game.players, initialScores]);

  function setScore(playerId: PlayerId, value: number) {
    const nextEdited = new Set(edited).add(playerId);
    setEdited(nextEdited);
    setScores((current) => {
      const next = { ...current, [playerId]: value };
      return game.zeroSum ? applyZeroSum(playerIds, next, nextEdited) : next;
    });
  }

  function clearAll() {
    const cleared: Record<PlayerId, number> = {};
    for (const player of game.players) cleared[player.id] = 0;
    setScores(cleared);
    setEdited(new Set());
  }

  return (
    <Sheet visible={visible} onClose={onCancel} fill={0.8}>
      <View style={styles.headerBlock}>
        <View style={styles.head}>
          <Pressable style={styles.headSide} onPress={onCancel} accessibilityRole="button" hitSlop={10}>
            <Text tone="ink2">Huỷ</Text>
          </Pressable>
          <Text variant="titleSheet" numberOfLines={1} style={styles.headTitle} accessibilityRole="header">
            {title}
          </Text>
          <Pressable style={styles.headSideRight} onPress={clearAll} accessibilityRole="button" hitSlop={10}>
            <Text tone="ink2">Xoá hết</Text>
          </Pressable>
        </View>

        {game.zeroSum ? <ZeroSumBar total={total} balanced={balanced} /> : null}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {game.players.map((player) => (
          <PlayerScoreRow
            key={player.id}
            game={game}
            playerId={player.id}
            value={scores[player.id] ?? 0}
            focused={player.id === focusPlayerId}
            auto={player.id === autoId}
            onChange={(value) => setScore(player.id, value)}
          />
        ))}
      </ScrollView>

      <Button label={saveLabel} disabled={!balanced} onPress={() => onSave(scores)} />
    </Sheet>
  );
}

/** Cho thấy vòng đã cân chưa, ngay trên danh sách người chơi. */
function ZeroSumBar({ total, balanced }: { total: number; balanced: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.zeroBar}>
      <Text variant="caption" tone={balanced ? 'ink3' : 'danger'}>
        {balanced ? 'Tổng vòng đã cân' : 'Tổng vòng phải bằng 0'}
      </Text>
      <Text
        variant="bodyStrong"
        tone={balanced ? 'ink3' : 'danger'}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatScore(total)}
      </Text>
    </View>
  );
}

function PlayerScoreRow({
  game,
  playerId,
  value,
  focused,
  auto,
  onChange,
}: {
  game: Game;
  playerId: PlayerId;
  value: number;
  focused: boolean;
  auto: boolean;
  onChange: (value: number) => void;
}) {
  const styles = useStyles();
  const player = game.players.find((candidate) => candidate.id === playerId)!;
  const color = usePlayerColor(player);

  return (
    <View style={[styles.row, focused && { borderColor: color, borderWidth: 1.5 }]}>
      <View style={styles.who}>
        <PlayerAvatar player={player} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {player.name}
          </Text>
          {auto ? (
            <Text variant="caption" tone="ink3" style={{ fontSize: 11.5 }}>
              tự tính
            </Text>
          ) : null}
        </View>
      </View>
      <Stepper value={value} onChange={onChange} accessibilityLabel={`Điểm của ${player.name}`} />
    </View>
  );
}
