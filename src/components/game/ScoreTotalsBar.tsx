import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { formatScore, scoreFontSize } from "@/domain/layout";
import { standings, trendFor } from "@/domain/scoring";
import { makeStyles } from "@/theme/ThemeProvider";
import type { Game, PlayerId } from "@/domain/types";

import { PlayerAvatar, usePlayerColor } from "./PlayerAvatar";
import { TrendMark } from "./TrendMark";

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: "row",
    backgroundColor: t.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.color.line2,
  },
  cell: {
    alignItems: "center",
    gap: 3,
    paddingTop: t.space.md - 1,
    paddingBottom: t.space.md,
    paddingHorizontal: 2,
  },
  /** Đúng chỗ vương miện cũ, và hiện cho mọi người chứ không riêng người dẫn đầu. */
  trendMark: { position: "absolute", top: 10, right: 10 },
  leaderBar: {
    position: "absolute",
    left: "12%",
    right: "12%",
    bottom: 0,
    height: 3,
    borderRadius: 2,
  },
  name: { maxWidth: "100%" },
  pressed: { opacity: 0.55 },
}));

/**
 * Tổng điểm ghim trên đầu bảng — chữ to nhất app. Liếc một cái là biết ai dẫn.
 * Người dẫn đầu đánh dấu hai lớp: vương miện và gạch màu ở đáy ô,
 * để không phụ thuộc riêng vào màu.
 */
export function ScoreTotalsBar({
  game,
  columnWidth,
  leaderId,
  showTotals,
  onPressPlayer,
}: {
  game: Game;
  columnWidth: number;
  leaderId: PlayerId | null;
  /** Tắt thì giấu con số, nhưng vẫn giữ mũi tên xu hướng và vạch màu người dẫn. */
  showTotals: boolean;
  onPressPlayer?: (playerId: PlayerId) => void;
}) {
  const styles = useStyles();
  const table = standings(game);
  const byId = new Map(table.map((row) => [row.player.id, row]));
  const fontSize = scoreFontSize(game.players.length);

  return (
    <View style={styles.bar}>
      {game.players.map((player) => (
        <TotalCell
          key={player.id}
          game={game}
          playerId={player.id}
          width={columnWidth}
          fontSize={fontSize}
          total={byId.get(player.id)?.total ?? 0}
          showTotal={showTotals}
          isLeader={player.id === leaderId}
          onPress={onPressPlayer ? () => onPressPlayer(player.id) : undefined}
        />
      ))}
    </View>
  );
}

function TotalCell({
  game,
  playerId,
  width,
  fontSize,
  total,
  showTotal,
  isLeader,
  onPress,
}: {
  game: Game;
  playerId: PlayerId;
  width: number;
  fontSize: number;
  total: number;
  showTotal: boolean;
  isLeader: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles();
  const player = game.players.find((candidate) => candidate.id === playerId)!;
  const color = usePlayerColor(player);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Sửa ${player.name}` : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.cell, { width }, pressed && onPress ? styles.pressed : null]}
    >
      {game.rounds.length > 0 ? (
        <View style={styles.trendMark}>
          <TrendMark trend={trendFor(game, playerId)} size={12} />
        </View>
      ) : null}
      <PlayerAvatar player={player} size="sm" />
      <Text
        variant="caption"
        tone={isLeader ? "ink" : "ink2"}
        numberOfLines={1}
        style={[
          styles.name,
          { fontSize: 11, fontWeight: isLeader ? "600" : "400" },
        ]}
      >
        {player.name}
      </Text>
      {showTotal ? (
        <Text variant="scoreTotal" style={{ fontSize }}>
          {formatScore(total)}
        </Text>
      ) : null}
      {isLeader ? (
        <View style={[styles.leaderBar, { backgroundColor: color }]} />
      ) : null}
    </Pressable>
  );
}
