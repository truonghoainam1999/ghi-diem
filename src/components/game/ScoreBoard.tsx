import { useRef, type ReactNode } from 'react';
import { Animated, ScrollView, View, useWindowDimensions } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { ROUND_COL, needsHorizontalScroll, playerColumnWidth } from '@/domain/layout';
import { leaderId } from '@/domain/scoring';
import { makeStyles } from '@/theme/ThemeProvider';
import type { Game, PlayerId, RoundId } from '@/domain/types';

import { RoundNumberColumn, RoundScoreRows } from './RoundGrid';
import { ScoreTotalsBar } from './ScoreTotalsBar';

const useStyles = makeStyles((t) => ({
  root: { flex: 1 },
  header: { flexDirection: 'row' },
  /** Ô trống góc trên trái, nằm trên cột số vòng và ngang hàng với hàng tổng. */
  corner: {
    width: ROUND_COL,
    backgroundColor: t.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.color.line2,
  },
  /** Khung cắt cho hàng tổng khi nó bị kéo ngang theo lưới. */
  headerViewport: { flex: 1, overflow: 'hidden' },
  body: { flex: 1 },
  bodyRow: { flexDirection: 'row', alignItems: 'flex-start' },
  grid: { flex: 1 },
}));

/**
 * Ghép hàng tổng điểm với lưới vòng, và quyết định có cuộn ngang hay không.
 *
 * Tới 8 người vẫn vừa màn 390pt nhờ sàn 44pt mỗi cột, lúc đó mọi thứ nằm yên.
 * Từ 9 người trở lên mới cuộn ngang — và khi đó cột "Vòng" đứng yên bên trái,
 * vì cuộn mà mất số vòng thì không biết mình đang đọc dòng nào.
 */
export function ScoreBoard({
  game,
  onPressCell,
  onPressPlayer,
}: {
  game: Game;
  onPressCell?: (roundId: RoundId, playerId: PlayerId) => void;
  onPressPlayer?: (playerId: PlayerId) => void;
}) {
  const styles = useStyles();
  const { width } = useWindowDimensions();

  const playerCount = game.players.length;
  const columnWidth = playerColumnWidth(playerCount, width);
  const scrolls = needsHorizontalScroll(playerCount, width);
  const playersWidth = columnWidth * playerCount;

  /**
   * Lưới là thứ duy nhất cuộn được; hàng tổng chỉ bị kéo theo bằng translateX.
   * Cho cả hai cùng cuộn rồi đồng bộ hai chiều thì phải có cờ chống vọng, và
   * ScrollView ngang nằm trong hàng lại không tự có chiều cao — nên hỏng cả hai đằng.
   */
  const scrollX = useRef(new Animated.Value(0)).current;

  const totals = (
    <ScoreTotalsBar
      game={game}
      columnWidth={columnWidth}
      leaderId={leaderId(game)}
      // Bỏ trống coi như bật — ván lưu từ trước khi có tuỳ chọn này vẫn hiện như cũ.
      showTotals={game.showTotals !== false}
      onPressPlayer={onPressPlayer}
    />
  );

  const rows = <RoundScoreRows game={game} columnWidth={columnWidth} onPressCell={onPressCell} />;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.corner} />
        {scrolls ? (
          <View style={styles.headerViewport}>
            <Animated.View
              style={{
                width: playersWidth,
                transform: [{ translateX: Animated.multiply(scrollX, -1) }],
              }}
            >
              {totals}
            </Animated.View>
          </View>
        ) : (
          <View style={styles.grid}>{totals}</View>
        )}
      </View>

      {game.rounds.length === 0 ? (
        <EmptyState title="Chưa có vòng nào" body="Bấm “Nhập điểm vòng 1” để bắt đầu ghi." />
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
          <BodyRow
            scrolls={scrolls}
            playersWidth={playersWidth}
            scrollX={scrollX}
            numbers={<RoundNumberColumn game={game} />}
            rows={rows}
          />
        </ScrollView>
      )}
    </View>
  );
}

function BodyRow({
  scrolls,
  playersWidth,
  scrollX,
  numbers,
  rows,
}: {
  scrolls: boolean;
  playersWidth: number;
  scrollX: Animated.Value;
  numbers: ReactNode;
  rows: ReactNode;
}) {
  const styles = useStyles();

  return (
    <View style={styles.bodyRow}>
      {numbers}
      {scrolls ? (
        // Animated.ScrollView chứ không phải ScrollView: Animated.event ở chế độ
        // native driver trả về một đối tượng, ScrollView thường sẽ gọi nó như hàm.
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
        >
          <View style={{ width: playersWidth }}>{rows}</View>
        </Animated.ScrollView>
      ) : (
        <View style={styles.grid}>{rows}</View>
      )}
    </View>
  );
}
