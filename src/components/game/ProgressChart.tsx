import { Fragment } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { formatScore } from '@/domain/layout';
import { cumulativeSeries } from '@/domain/scoring';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Game } from '@/domain/types';

import { initialOf } from './PlayerAvatar';

const HEIGHT = 190;
const PAD_LEFT = 30;
const PAD_RIGHT = 24;
const PAD_TOP = 12;
const PAD_BOTTOM = 20;

/** Bước chia lưới làm tròn đẹp: 1, 2, 5 rồi nhân lên theo bậc 10. */
function niceStep(span: number, target = 4): number {
  const raw = Math.max(span, 1) / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.card,
    padding: t.space.md,
    gap: t.space.sm,
  },
}));

/**
 * Diễn biến điểm cộng dồn qua từng vòng: dọc là điểm, ngang là số vòng,
 * mọi người cùng xuất phát từ 0.
 *
 * Bảng điểm cho biết ai đang dẫn; biểu đồ này cho biết họ dẫn từ lúc nào và
 * đường đi có phẳng hay gãy khúc — thứ mà cột số không kể được.
 *
 * Mỗi đường kết thúc bằng một chấm mang chữ cái đầu của người chơi, nên danh
 * tính không phụ thuộc riêng vào màu.
 */
export function ProgressChart({ game }: { game: Game }) {
  const styles = useStyles();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  // Cần ít nhất một vòng thì mới có gì để vẽ.
  if (game.rounds.length === 0) return null;

  const width = screenWidth - theme.GUTTER * 2 - theme.space.md * 2;
  const plotWidth = width - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const series = game.players.map((player) => ({
    player,
    values: cumulativeSeries(game, player.id),
    color: theme.playerColors[player.colorIndex % theme.playerColors.length],
  }));

  const all = series.flatMap((s) => s.values);
  // Luôn kẹp 0 vào trong khoảng để mốc xuất phát nằm trên trục.
  const rawMax = Math.max(0, ...all);
  const rawMin = Math.min(0, ...all);
  const span = rawMax - rawMin || 1;
  const max = rawMax + span * 0.08;
  const min = rawMin - span * 0.08;

  const lastRound = game.rounds.length;
  const x = (round: number) => PAD_LEFT + (round / lastRound) * plotWidth;
  const y = (value: number) => PAD_TOP + ((max - value) / (max - min)) * plotHeight;

  const zeroY = y(0);

  // Bước lưới ngang làm tròn đẹp (1, 2, 5, 10, 20, 50…) để nhãn không ra số lẻ.
  const gridStep = niceStep(max - min);
  const gridValues: number[] = [];
  for (let v = Math.ceil(min / gridStep) * gridStep; v <= max; v += gridStep) {
    if (Math.abs(v) > 1e-9) gridValues.push(v);
  }

  // Vạch dọc mỗi vòng khi ván còn ngắn; ván dài thì chỉ vạch ở chỗ có nhãn,
  // không thì lưới dày đặc át cả đường điểm.
  const labelEvery = Math.max(1, Math.ceil(lastRound / 4));
  const rounds = Array.from({ length: lastRound }, (_, i) => i + 1);
  const gridRounds = lastRound <= 12 ? rounds : rounds.filter((r) => r % labelEvery === 0);

  // Đi ngược từ vòng cuối về đầu, bỏ nhãn nào đứng quá sát nhãn vừa giữ.
  // Chia đều cứng sẽ cho ra "v9 v10" dính nhau khi số vòng không chia hết.
  const MIN_LABEL_GAP = 34;
  const labelRounds: number[] = [];
  for (let round = lastRound; round >= 1; round--) {
    const isCandidate = round === lastRound || round === 1 || round % labelEvery === 0;
    if (!isCandidate) continue;
    const previous = labelRounds[labelRounds.length - 1];
    if (previous !== undefined && x(previous) - x(round) < MIN_LABEL_GAP) continue;
    labelRounds.push(round);
  }
  labelRounds.reverse();

  /**
   * Hai người điểm sát nhau thì nhãn đầu mút đè lên nhau và mất hẳn một cái.
   * Đẩy chúng tách ra theo chiều dọc, giữ nguyên thứ tự trên dưới nên vẫn đọc
   * đúng ai hơn ai; đường vẽ vẫn ở đúng chỗ, chỉ cái nhãn xê dịch vài pixel.
   */
  const BADGE_GAP = 19;
  const topBound = PAD_TOP + 9;
  const bottomBound = HEIGHT - PAD_BOTTOM - 9;

  const endLabels = series
    .map((line) => ({ line, value: line.values[line.values.length - 1] }))
    .sort((a, b) => y(b.value) - y(a.value))
    .map((entry) => ({ ...entry, labelY: y(entry.value) }));

  // Duyệt từ dưới lên: cái nào sát cái dưới nó quá thì nhấc lên đủ khoảng cách.
  for (let i = 1; i < endLabels.length; i++) {
    const gap = endLabels[i - 1].labelY - endLabels[i].labelY;
    if (gap < BADGE_GAP) endLabels[i].labelY = endLabels[i - 1].labelY - BADGE_GAP;
  }
  // Đẩy lên có thể vượt mép trên: dồn cả cụm xuống lại cho vừa khung.
  const overflow = topBound - Math.min(...endLabels.map((e) => e.labelY));
  if (overflow > 0) endLabels.forEach((e) => (e.labelY += overflow));
  endLabels.forEach((e) => (e.labelY = Math.min(bottomBound, Math.max(topBound, e.labelY))));

  return (
    <View style={styles.card}>
      <Svg width={width} height={HEIGHT}>
        {/* Lưới vẽ mờ và vẽ trước, để nó nằm dưới đường điểm chứ không cạnh tranh. */}
        {gridValues.map((value) => (
          <Fragment key={`h${value}`}>
            <Line
              x1={PAD_LEFT}
              y1={y(value)}
              x2={width - PAD_RIGHT}
              y2={y(value)}
              stroke={theme.color.line}
              strokeWidth={1}
            />
            <SvgText x={PAD_LEFT - 6} y={y(value) + 3.5} fontSize={10} fill={theme.color.ink3} textAnchor="end">
              {formatScore(value)}
            </SvgText>
          </Fragment>
        ))}

        {gridRounds.map((round) => (
          <Line
            key={`v${round}`}
            x1={x(round)}
            y1={PAD_TOP}
            x2={x(round)}
            y2={HEIGHT - PAD_BOTTOM}
            stroke={theme.color.line}
            strokeWidth={1}
          />
        ))}

        {/* Mốc 0 đậm hơn lưới: đây là vạch xuất phát chung của cả bàn. */}
        <Line x1={PAD_LEFT} y1={zeroY} x2={width - PAD_RIGHT} y2={zeroY} stroke={theme.color.line2} strokeWidth={1.5} />
        <SvgText x={PAD_LEFT - 6} y={zeroY + 3.5} fontSize={10} fill={theme.color.ink3} textAnchor="end">
          0
        </SvgText>

        {labelRounds.map((round) => (
          <SvgText
            key={`x${round}`}
            x={x(round)}
            y={HEIGHT - 4}
            fontSize={10}
            fill={theme.color.ink3}
            textAnchor={round === lastRound ? 'end' : 'middle'}
          >
            {`v${round}`}
          </SvgText>
        ))}

        {series.map((line) => (
          <Polyline
            key={line.player.id}
            points={line.values.map((value, round) => `${x(round)},${y(value)}`).join(' ')}
            fill="none"
            stroke={line.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Nhãn gắn thẳng vào đầu mút mỗi đường, thay cho khung chú giải riêng. */}
        {endLabels.map(({ line, value, labelY }) => (
          <Fragment key={line.player.id}>
            {Math.abs(labelY - y(value)) > 1 ? (
              <Line
                x1={x(lastRound)}
                y1={y(value)}
                x2={x(lastRound)}
                y2={labelY}
                stroke={line.color}
                strokeWidth={1}
                opacity={0.5}
              />
            ) : null}
            <Circle cx={x(lastRound)} cy={labelY} r={8} fill={line.color} stroke={theme.color.surface} strokeWidth={2} />
            <SvgText
              x={x(lastRound)}
              y={labelY + (line.player.emoji ? 4 : 3.5)}
              fontSize={line.player.emoji ? 10 : 9}
              fontWeight="700"
              fill={theme.color.onInk}
              textAnchor="middle"
            >
              {line.player.emoji ?? initialOf(line.player.name)}
            </SvgText>
          </Fragment>
        ))}
      </Svg>
    </View>
  );
}
