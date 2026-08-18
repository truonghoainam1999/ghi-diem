import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { formatScore } from '@/domain/layout';
import { standings } from '@/domain/scoring';
import { makeStyles } from '@/theme/ThemeProvider';
import type { Game } from '@/domain/types';

import { AvatarStack } from './AvatarStack';
import { gameLabel } from './playersLabel';
import { relativeTime } from './relativeTime';

const useStyles = makeStyles((t) => ({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space.md },
  foot: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  pressed: { opacity: 0.7 },
}));

/** Ván đang chơi: thẻ to, ở trên cùng, chạm một phát là vào thẳng bảng điểm. */
export function ActiveGameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const styles = useStyles();
  const table = standings(game);
  const leader = table[0];
  const tied = table.filter((row) => row.rank === 1).length > 1;

  const meta = [
    game.rounds.length > 0 ? `vòng ${game.rounds.length}` : 'chưa có vòng nào',
    relativeTime(game.createdAt),
  ].join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mở ván của ${gameLabel(game)}`}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <View style={styles.head}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="titleNav" numberOfLines={1}>
              {gameLabel(game)}
            </Text>
            <Text variant="caption" tone="ink3">
              {meta}
            </Text>
          </View>
          <Text variant="titleNav" tone="ink3">
            ›
          </Text>
        </View>

        <View style={styles.foot}>
          <AvatarStack players={game.players} />
          {leader ? (
            <>
              <Text variant="caption" tone="ink3" style={{ marginLeft: 6, flex: 1 }} numberOfLines={1}>
                {tied ? 'đang hoà' : `${leader.player.name} dẫn`}
              </Text>
              <Text variant="titleNav">{formatScore(leader.total)}</Text>
            </>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
