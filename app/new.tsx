import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { PlayerPicker } from '@/components/game/PlayerPicker';
import { BottomBar } from '@/components/ui/BottomBar';
import { Button } from '@/components/ui/Button';
import { NavBar } from '@/components/ui/NavBar';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { ToggleRow } from '@/components/ui/ToggleRow';
import type { EndCondition, PlayerDraft, ScoreDirection } from '@/domain/types';
import { useGames } from '@/storage/GamesProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';

type EndKind = EndCondition['kind'];

const DIRECTIONS = [
  { value: 'high' as ScoreDirection, label: 'Điểm cao' },
  { value: 'low' as ScoreDirection, label: 'Điểm thấp' },
];

const END_KINDS = [
  { value: 'rounds' as EndKind, label: 'Đủ vòng' },
  { value: 'target' as EndKind, label: 'Đạt điểm' },
  { value: 'manual' as EndKind, label: 'Tự bấm' },
];

const useStyles = makeStyles((t) => ({
  body: {
    paddingHorizontal: t.GUTTER,
    paddingTop: t.space.lg,
    paddingBottom: t.space.xl,
    gap: t.space.md + 2,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    paddingHorizontal: t.space.md,
    minHeight: t.HIT,
    fontSize: 15,
    color: t.color.ink,
  },
  limitInput: {
    width: 96,
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    paddingHorizontal: t.space.md,
    minHeight: t.HIT,
    fontSize: 15,
    textAlign: 'center',
    color: t.color.ink,
  },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  /** Chỗ trống cuối trang để bàn phím số không đè lên ô đang gõ. */
  keyboardRoom: { height: 220 },
}));

/** Màn 02 — phải xong dưới 15 giây, kể cả khi cả bàn đang chờ. */
export default function NewGameScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const { createGame } = useGames();

  const [title, setTitle] = useState('');
  const [players, setPlayers] = useState<PlayerDraft[]>([]);
  const [direction, setDirection] = useState<ScoreDirection>('high');
  const [endKind, setEndKind] = useState<EndKind>('manual');
  const [limit, setLimit] = useState('10');
  const [zeroSum, setZeroSum] = useState(false);

  const canStart = players.length >= 2;

  function start() {
    const parsedLimit = Number(limit) || 0;
    const end: EndCondition =
      endKind === 'rounds'
        ? { kind: 'rounds', rounds: Math.max(1, parsedLimit) }
        : endKind === 'target'
          ? { kind: 'target', score: parsedLimit }
          : { kind: 'manual' };

    const game = createGame({ title, players, direction, end, zeroSum });
    router.replace(`/game/${game.id}`);
  }

  // Mở chồng lên màn khác thì đây là sheet, đã nằm dưới tai thỏ sẵn nên cộng
  // thêm inset là thừa. Nhưng nếu nó là màn đầu tiên — reload app đúng lúc đang
  // ở đây chẳng hạn — thì lại chiếm nguyên màn hình và cần inset thật.
  const presentedAsSheet = router.canGoBack();

  return (
    <Screen edges={!presentedAsSheet}>
      <NavBar
        ruled
        size="sheet"
        title="Ván mới"
        left={
          <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.back()}>
            <Text tone="ink2">Huỷ</Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // Đẩy nội dung lên khi bàn phím mở, và cuộn ô đang gõ vào tầm nhìn.
        automaticallyAdjustKeyboardInsets
      >
        <SectionLabel>Tên ván</SectionLabel>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Không bắt buộc — bỏ trống thì gọi theo tên nhóm"
          placeholderTextColor={theme.color.ink3}
          style={styles.titleInput}
        />

        <SectionLabel>{`Người chơi · ${players.length}`}</SectionLabel>
        <PlayerPicker players={players} onChange={setPlayers} />

        <SectionLabel>Cách tính điểm</SectionLabel>
        <SegmentedControl options={DIRECTIONS} value={direction} onChange={setDirection} />
        <ToggleRow
          label="Tổng mỗi vòng bằng 0"
          hint="Ai được thì người khác mất. Người cuối cùng chưa nhập sẽ tự điền cho đủ 0."
          value={zeroSum}
          onChange={setZeroSum}
        />

        <SectionLabel>Kết thúc khi</SectionLabel>
        <SegmentedControl options={END_KINDS} value={endKind} onChange={setEndKind} />

        {endKind !== 'manual' ? (
          <>
            <View style={styles.limitRow}>
              <TextInput
                value={limit}
                onChangeText={setLimit}
                keyboardType="number-pad"
                selectTextOnFocus
                style={styles.limitInput}
              />
              <Text tone="ink3">{endKind === 'rounds' ? 'vòng thì dừng' : 'điểm thì dừng'}</Text>
            </View>
            <View style={styles.keyboardRoom} />
          </>
        ) : null}
      </ScrollView>

      <BottomBar>
        <Button
          label={players.length < 2 ? 'Cần ít nhất 2 người' : 'Bắt đầu chơi'}
          disabled={!canStart}
          onPress={start}
          style={{ flex: 1 }}
        />
      </BottomBar>
    </Screen>
  );
}
