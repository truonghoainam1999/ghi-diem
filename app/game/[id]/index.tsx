import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ScoreBoard } from '@/components/game/ScoreBoard';
import { PlayerAppearanceSheet } from '@/components/game/PlayerAppearanceSheet';
import { ScoreEntrySheet } from '@/components/game/ScoreEntrySheet';
import { gameLabel } from '@/components/game/playersLabel';
import { ActionSheet, type SheetAction } from '@/components/ui/ActionSheet';
import { BottomBar } from '@/components/ui/BottomBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { NavBar } from '@/components/ui/NavBar';
import { PromptModal } from '@/components/ui/PromptModal';
import { Screen } from '@/components/ui/Screen';
import { hasReachedEnd, nextRoundNumber } from '@/domain/scoring';
import { useGame, useGames } from '@/storage/GamesProvider';
import type { Game, PlayerId, RoundId } from '@/domain/types';

/** Màn 03 — màn nhìn nhiều nhất. Điện thoại nằm giữa bàn, nhìn từ xa và nghiêng. */
export default function ScoreBoardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const game = useGame(id);

  if (!game) {
    return (
      <Screen>
        <NavBar title="Không tìm thấy ván" left={<IconButton glyph="‹" label="Quay lại" onPress={() => router.back()} />} />
        <EmptyState title="Ván này không còn" body="Có thể nó đã bị xoá." actionLabel="Về danh sách" onAction={() => router.replace('/')} />
      </Screen>
    );
  }

  return <ScoreBoardView game={game} />;
}

function ScoreBoardView({ game }: { game: Game }) {
  const router = useRouter();
  const { addRound, updateRoundScore, addPlayer, updatePlayer, setShowTotals, deleteGame } = useGames();

  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState<{ roundId: RoundId; playerId: PlayerId } | null>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<PlayerId | null>(null);

  const editingPlayer = game.players.find((player) => player.id === editingPlayerId);

  const roundNumber = nextRoundNumber(game);
  const editingRound = editing ? game.rounds.find((round) => round.id === editing.roundId) : undefined;
  const editingRoundNumber = editingRound ? game.rounds.indexOf(editingRound) + 1 : 0;

  function saveNewRound(scores: Record<PlayerId, number>) {
    setEntryOpen(false);
    addRound(game.id, scores);

    // Kiểm tra trên bản đã cộng vòng mới, vì state ngoài chưa kịp cập nhật.
    const next = { ...game, rounds: [...game.rounds, { id: 'tmp', scores, createdAt: Date.now() }] };
    if (!hasReachedEnd(next)) return;

    // Chỉ dẫn sang màn kết quả, chưa chốt — nút "Kết thúc" ở màn đó mới chốt.
    Alert.alert('Đã tới điều kiện kết thúc', 'Xem kết quả ngay bây giờ?', [
      { text: 'Chơi tiếp', style: 'cancel' },
      { text: 'Xem kết quả', onPress: () => router.push(`/game/${game.id}/result`) },
    ]);
  }

  function saveEditedRound(scores: Record<PlayerId, number>) {
    if (!editing) return;
    for (const player of game.players) {
      updateRoundScore(game.id, editing.roundId, player.id, scores[player.id] ?? 0);
    }
    setEditing(null);
  }

  const menuActions: SheetAction[] = [
    { label: 'Thêm người chơi', onPress: () => setAddingPlayer(true) },
    { label: 'Kết thúc ván', onPress: () => router.push(`/game/${game.id}/result`) },
    {
      label: 'Xoá ván này',
      destructive: true,
      onPress: () =>
        Alert.alert('Xoá ván này?', 'Không khôi phục lại được.', [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xoá',
            style: 'destructive',
            onPress: () => {
              deleteGame(game.id);
              router.replace('/');
            },
          },
        ]),
    },
  ];

  return (
    <Screen>
      <NavBar
        title={gameLabel(game, 2)}
        subtitle={`vòng ${game.rounds.length} · ${game.players.length} người`}
        left={<IconButton glyph="‹" label="Quay lại" glyphScale={0.62} onPress={() => router.back()} />}
        right={
          <IconButton glyph="⋯" label="Tuỳ chọn ván" glyphScale={0.62} onPress={() => setMenuOpen(true)} />
        }
      />

      <ScoreBoard
        game={game}
        onPressCell={(roundId, playerId) => setEditing({ roundId, playerId })}
        onPressPlayer={setEditingPlayerId}
      />

      <BottomBar>
        <Button label={`Nhập điểm vòng ${roundNumber}`} onPress={() => setEntryOpen(true)} style={{ flex: 1 }} />
      </BottomBar>

      <ScoreEntrySheet
        game={game}
        visible={entryOpen}
        title={`Vòng ${roundNumber}`}
        saveLabel={`Lưu vòng ${roundNumber}`}
        onCancel={() => setEntryOpen(false)}
        onSave={saveNewRound}
      />

      <ScoreEntrySheet
        game={game}
        visible={editing !== null}
        title={`Sửa vòng ${editingRoundNumber}`}
        saveLabel="Lưu thay đổi"
        initialScores={editingRound?.scores}
        focusPlayerId={editing?.playerId}
        onCancel={() => setEditing(null)}
        onSave={saveEditedRound}
      />

      <ActionSheet
        visible={menuOpen}
        title={gameLabel(game)}
        subtitle={`${game.rounds.length} vòng · ${game.players.length} người`}
        toggles={[
          {
            label: 'Hiện tổng điểm',
            hint: 'Tắt đi thì giấu con số, vẫn giữ mũi tên xu hướng và vạch màu người dẫn.',
            value: game.showTotals !== false,
            onChange: (value) => setShowTotals(game.id, value),
          },
        ]}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />

      <PlayerAppearanceSheet
        visible={editingPlayer !== undefined}
        draft={
          editingPlayer
            ? {
                name: editingPlayer.name,
                colorIndex: editingPlayer.colorIndex,
                emoji: editingPlayer.emoji,
              }
            : null
        }
        onCancel={() => setEditingPlayerId(null)}
        onSave={(patch) => {
          if (editingPlayerId) updatePlayer(game.id, editingPlayerId, patch);
          setEditingPlayerId(null);
        }}
      />

      <PromptModal
        visible={addingPlayer}
        title="Thêm người chơi"
        placeholder="Tên người chơi"
        confirmLabel="Thêm"
        onCancel={() => setAddingPlayer(false)}
        onConfirm={(name) => {
          addPlayer(game.id, name);
          setAddingPlayer(false);
        }}
      />
    </Screen>
  );
}
