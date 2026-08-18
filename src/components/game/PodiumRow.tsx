import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { formatScore } from '@/domain/layout';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Standing } from '@/domain/types';

import { PlayerAvatar, usePlayerColor } from './PlayerAvatar';

/** Trên 5 người thì cột hẹp quá, chuyển sang cuộn ngang với bề rộng cố định. */
const FIT_LIMIT = 5;
const SCROLL_COLUMN = 84;

const TALLEST = 104;
const SHORTEST = 40;

/**
 * Bục cao dần đều theo hạng, chia theo số người trên bàn: hạng nhất luôn cao
 * nhất, hạng chót luôn thấp nhất, các hạng giữa nằm đều khoảng cách. Nhờ vậy
 * bàn 4 người và bàn 8 người đều ra một bậc thang cân đối, không phải bàn đông
 * thì bục nào cũng bẹt như nhau.
 */
function pedestalHeight(rank: number, playerCount: number): number {
  if (playerCount <= 1) return TALLEST;
  const step = (TALLEST - SHORTEST) / (playerCount - 1);
  return Math.round(SHORTEST + step * (playerCount - rank));
}

/**
 * Xếp thành hình tháp quanh người vô địch: nhất đứng chính giữa, nhì sang
 * trái, ba sang phải, tư trái nữa, năm phải nữa. Mắt tìm người thắng ở giữa
 * trước rồi mới toả ra hai bên.
 */
function podiumOrder(rows: Standing[]): Standing[] {
  const left: Standing[] = [];
  const right: Standing[] = [];

  rows.slice(1).forEach((row, index) => {
    if (index % 2 === 0) left.unshift(row);
    else right.push(row);
  });

  return rows.length > 0 ? [...left, rows[0], ...right] : [];
}

const useStyles = makeStyles((t) => ({
  /** Căn đáy để bục cao đẩy người đứng trên nó lên cao hơn. */
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  column: { alignItems: 'center', gap: 4 },
  name: { maxWidth: '100%' },
  pedestal: {
    alignSelf: 'stretch',
    borderTopLeftRadius: t.radius.cell,
    borderTopRightRadius: t.radius.cell,
    backgroundColor: t.color.raised,
    borderTopWidth: 3,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal: { alignItems: 'center' },
  ribbon: { flexDirection: 'row', gap: 3, marginBottom: -7 },
  ribbonTail: { width: 5, height: 13, borderRadius: 1 },
  disc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: t.color.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/**
 * Bảng xếp hạng dạng bục trao giải: tất cả trên một hàng, ai hạng cao đứng cao.
 * Thay cho danh sách dọc — hạng là thứ so sánh, mà so sánh thì đọc bằng chiều
 * cao nhanh hơn đọc bằng con số.
 */
export function PodiumRow({ rows }: { rows: Standing[] }) {
  const styles = useStyles();
  const ordered = podiumOrder(rows);
  const scrolls = rows.length > FIT_LIMIT;

  const columns = ordered.map((row) => (
    <PodiumColumn
      key={row.player.id}
      row={row}
      playerCount={rows.length}
      width={scrolls ? SCROLL_COLUMN : undefined}
    />
  ));

  if (!scrolls) return <View style={styles.row}>{columns}</View>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>{columns}</View>
    </ScrollView>
  );
}

function PodiumColumn({
  row,
  playerCount,
  width,
}: {
  row: Standing;
  playerCount: number;
  width?: number;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const color = usePlayerColor(row.player);

  const medalColor =
    row.rank === 1
      ? theme.medal.gold
      : row.rank === 2
        ? theme.medal.silver
        : row.rank === 3
          ? theme.medal.bronze
          : null;

  return (
    <View style={[styles.column, width ? { width } : { flex: 1 }]}>
      <PlayerAvatar player={row.player} size="md" />

      {/* Co chữ cho vừa cột thay vì cắt bớt: cột bục căn theo đáy nên tên xuống
          hai dòng sẽ đẩy riêng cột đó lên cao, làm lệch cả hàng. */}
      <Text
        variant="caption"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        style={[styles.name, { fontSize: 12 }]}
      >
        {row.player.name}
      </Text>

      <Text variant="scoreTotal" style={{ fontSize: 20 }}>
        {formatScore(row.total)}
      </Text>

      <View
        style={[
          styles.pedestal,
          { height: pedestalHeight(row.rank, playerCount), borderTopColor: color },
        ]}
      >
        {medalColor ? (
          <Medal color={medalColor} rank={row.rank} />
        ) : (
          <Text variant="caption" tone="ink3" style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            {row.rank}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Huy chương vẽ tay: hai dải ruy băng và một mặt tròn.
 * Không dùng emoji 🥇 vì mỗi hệ điều hành vẽ một kiểu, và nó không đổi màu
 * theo giao diện ngày/đêm như phần còn lại của app.
 */
function Medal({ color, rank }: { color: string; rank: number }) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.medal} accessible accessibilityLabel={`Huy chương hạng ${rank}`}>
      <View style={styles.ribbon}>
        <View style={[styles.ribbonTail, { backgroundColor: color, transform: [{ rotate: '-14deg' }] }]} />
        <View style={[styles.ribbonTail, { backgroundColor: color, transform: [{ rotate: '14deg' }] }]} />
      </View>
      <View style={[styles.disc, { backgroundColor: color }]}>
        <Text color={theme.color.onInk} style={{ fontSize: 11, fontWeight: '700', lineHeight: 13 }}>
          ★
        </Text>
      </View>
    </View>
  );
}
