import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { ROUND_COL, formatScore } from '@/domain/layout';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Game, PlayerId, RoundId } from '@/domain/types';

/**
 * Chiều cao cố định mỗi dòng. Cột số vòng và lưới điểm là hai khối riêng để
 * cột số ghim được khi cuộn ngang, nên chúng phải cao bằng nhau tuyệt đối —
 * để chiều cao tự co theo nội dung là hai bên lệch dòng ngay.
 */
export const ROW_HEIGHT = 46;

const useStyles = makeStyles((t) => ({
  column: { width: ROUND_COL, backgroundColor: t.color.surface },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: t.color.line,
    backgroundColor: t.color.surface,
  },
  /** Vòng vừa nhập xong: nền nhạt hơn để thấy ngay, không phải cuộn tìm. */
  latest: { backgroundColor: t.color.raised },
  numberCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.5 },
}));

/** Hiển thị ngược — vòng mới nhất trên cùng — nhưng vẫn giữ số hiệu vòng gốc. */
function reversedRounds(game: Game) {
  return game.rounds.map((round, index) => ({ round, number: index + 1 })).reverse();
}

/** Cột số vòng bên trái. Đứng yên khi lưới điểm cuộn ngang. */
export function RoundNumberColumn({ game }: { game: Game }) {
  const styles = useStyles();

  return (
    <View style={styles.column}>
      {reversedRounds(game).map(({ round, number }, index) => (
        <View key={round.id} style={[styles.row, index === 0 && styles.latest]}>
          <View style={styles.numberCell}>
            <Text variant="caption" tone="ink3" style={{ fontSize: 11, fontWeight: '600' }}>
              {number}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Lưới điểm từng vòng, không kèm số vòng. */
export function RoundScoreRows({
  game,
  columnWidth,
  onPressCell,
}: {
  game: Game;
  columnWidth: number;
  onPressCell?: (roundId: RoundId, playerId: PlayerId) => void;
}) {
  const styles = useStyles();

  return (
    <View>
      {reversedRounds(game).map(({ round, number }, index) => (
        <View key={round.id} style={[styles.row, index === 0 && styles.latest]}>
          {game.players.map((player) => (
            <ScoreCell
              key={player.id}
              width={columnWidth}
              value={round.scores[player.id] ?? 0}
              onPress={onPressCell ? () => onPressCell(round.id, player.id) : undefined}
              label={`${player.name}, vòng ${number}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function ScoreCell({
  width,
  value,
  onPress,
  label,
}: {
  width: number;
  value: number;
  onPress?: () => void;
  label: string;
}) {
  const styles = useStyles();
  const theme = useTheme();

  // Điểm 0 mờ đi, điểm âm đỏ — liếc cả bảng là thấy vòng nào có ăn thua.
  const color = value === 0 ? theme.color.ink3 : value < 0 ? theme.color.danger : theme.color.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sửa điểm ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.cell, { width, height: ROW_HEIGHT }, pressed && styles.pressed]}
    >
      <Text variant="cell" color={color}>
        {formatScore(value)}
      </Text>
    </Pressable>
  );
}
