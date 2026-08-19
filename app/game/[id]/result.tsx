import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Fireworks } from '@/components/game/Fireworks';
import { PodiumRow } from '@/components/game/PodiumRow';
import { gameLabel } from '@/components/game/playersLabel';
import { ProgressChart } from '@/components/game/ProgressChart';
import { formatDuration } from '@/components/game/relativeTime';
import { ActionSheet, type SheetAction } from '@/components/ui/ActionSheet';
import { BottomBar } from '@/components/ui/BottomBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { NavBar } from '@/components/ui/NavBar';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Text } from '@/components/ui/Text';
import { standings } from '@/domain/scoring';
import { useGame, useGames } from '@/storage/GamesProvider';
import { makeStyles } from '@/theme/ThemeProvider';
import type { Game } from '@/domain/types';

const useStyles = makeStyles((t) => ({
  body: { paddingHorizontal: t.GUTTER, paddingVertical: t.space.lg, gap: t.space.xl },
  header: { gap: 3 },
  /** Nhãn dính sát khối của nó, các khối thì cách nhau rộng hơn. */
  section: { gap: t.space.sm + 2 },
  /** Bục ngồi trên nền surface, đáy bục trùng đáy thẻ nên trông như đứng trên sàn. */
  podium: {
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.card,
    paddingTop: t.space.lg,
    paddingHorizontal: t.space.md,
    overflow: 'hidden',
  },
}));

/** Màn 05 — chỗ tự nhiên nhất để mở ván tiếp theo, vì bàn vẫn đang ngồi đủ người. */
export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const game = useGame(id);

  if (!game) {
    return (
      <Screen>
        <NavBar title="Không tìm thấy ván" left={<IconButton glyph="✕" label="Đóng" onPress={() => router.dismissTo('/')} />} />
        <EmptyState title="Ván này không còn" body="Có thể nó đã bị xoá." actionLabel="Về danh sách" onAction={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  return <ResultView game={game} />;
}

function ResultView({ game }: { game: Game }) {
  const styles = useStyles();
  const router = useRouter();
  const { createGame, finishGame, deleteGame } = useGames();

  const table = standings(game);
  const finishedAt = game.finishedAt ?? Date.now();

  // Bắn một lần lúc mở màn, rồi tự gỡ khỏi cây — không để 126 View sống tiếp.
  const [celebrating, setCelebrating] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const isFinished = game.finishedAt !== null;

  /**
   * Màn này có hai vai. Ván chưa chốt thì đây là bản xem trước, quay lại là về
   * bàn chơi tiếp. Ván đã chốt thì đây chỉ là hồ sơ để xem lại, quay lại là về
   * danh sách — không lặng lẽ mở khoá thứ người dùng đã cố ý đóng.
   *
   * Cả hai đường đều là *gỡ* màn đang chồng lên chứ không phải mở màn mới:
   * `replace` chỉ thay màn trên cùng nên màn cũ vẫn nằm nguyên phía dưới, bấm
   * back lại thấy đúng màn vừa rời — danh sách hiện ra hai lần liên tiếp.
   */
  function goBack() {
    if (isFinished) router.dismissTo('/');
    else router.dismissTo(`/game/${game.id}`);
  }

  function endGame() {
    finishGame(game.id);
    router.dismissTo('/');
  }

  function playAgain() {
    const next = createGame({
      title: game.title,
      // Giữ nguyên cả màu lẫn icon — chơi lại là cùng nhóm, không phải nhóm mới.
      players: game.players.map(({ name, colorIndex, emoji }) => ({ name, colorIndex, emoji })),
      direction: game.direction,
      end: game.end,
      zeroSum: game.zeroSum,
    });
    // Ván vừa xong và màn kết quả của nó không còn việc gì trong ngăn xếp: gỡ
    // hết về danh sách rồi mới mở ván mới, để back từ ván mới là ra danh sách.
    router.dismissTo('/');
    router.push(`/game/${next.id}`);
  }

  /**
   * Ván đã chốt thì màn này là chỗ duy nhất mở nó ra được, nên đường xoá cũng
   * phải nằm ở đây. Ván chưa chốt thì bàn chơi vẫn còn, xoá ở menu bên đó.
   */
  const menuActions: SheetAction[] = [
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
              router.dismissTo('/');
            },
          },
        ]),
    },
  ];

  return (
    <Screen>
      <NavBar
        ruled
        title="Kết quả"
        left={
          <IconButton
            glyph="‹"
            label={isFinished ? 'Về danh sách' : 'Quay lại ván'}
            glyphScale={0.62}
            onPress={goBack}
          />
        }
        right={
          isFinished ? (
            <IconButton glyph="⋯" label="Tuỳ chọn ván" glyphScale={0.62} onPress={() => setMenuOpen(true)} />
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text variant="titleSheet" numberOfLines={2}>
            {gameLabel(game, game.players.length)}
          </Text>
          <Text variant="caption" tone="ink3">
            {`${game.rounds.length} vòng · chơi trong ${formatDuration(game.createdAt, finishedAt)}`}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionLabel>Bảng xếp hạng</SectionLabel>
          <View style={styles.podium}>
            <PodiumRow rows={table} />
          </View>
        </View>

        {game.rounds.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>Diễn biến điểm</SectionLabel>
            <ProgressChart game={game} />
          </View>
        ) : null}
      </ScrollView>

      {/* Nằm cuối nên phủ lên mọi thứ, nhưng pointerEvents none nên không chặn nút nào. */}
      {celebrating ? <Fireworks onDone={() => setCelebrating(false)} /> : null}

      <BottomBar stacked>
        {/* Ván đã chốt thì không còn gì để chốt nữa — chỉ còn đường đi tiếp. */}
        {isFinished ? (
          <Button label="Chơi lại nhóm này" onPress={playAgain} />
        ) : (
          <>
            <Button label="Kết thúc" onPress={endGame} />
            <Button label="Chơi lại nhóm này" variant="ghost" onPress={playAgain} />
          </>
        )}
      </BottomBar>

      <ActionSheet
        visible={menuOpen}
        title={gameLabel(game, game.players.length)}
        subtitle={`${game.rounds.length} vòng · ${game.players.length} người`}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />
    </Screen>
  );
}
