import { View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { standings } from '@/domain/scoring';
import type { Game } from '@/domain/types';

import { PlayerAvatar } from './PlayerAvatar';
import { gameLabel } from './playersLabel';
import { formatDate } from './relativeTime';

/** Ván đã xong nén một dòng: tên, ngày, người thắng. Không ai cần điểm chi tiết ở đây. */
export function FinishedGameRow({ game, onPress, last }: { game: Game; onPress: () => void; last?: boolean }) {
  const winner = standings(game)[0];

  return (
    <ListRow
      last={last}
      onPress={onPress}
      accessibilityLabel={`Xem lại ván của ${gameLabel(game)}`}
      left={
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {gameLabel(game)}
          </Text>
          <Text variant="caption" tone="ink3">
            {formatDate(game.finishedAt ?? game.createdAt)} · {game.rounds.length} vòng
          </Text>
        </View>
      }
      right={
        winner ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PlayerAvatar player={winner.player} size="sm" />
            <Text variant="caption" tone="ink3">
              {winner.player.name} thắng
            </Text>
          </View>
        ) : null
      }
    />
  );
}
