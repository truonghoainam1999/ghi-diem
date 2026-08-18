import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Player } from '@/domain/types';

import { PlayerAvatar } from './PlayerAvatar';

/** Cho biết ai đang trong ván mà không tốn dòng chữ nào. */
export function AvatarStack({ players, max = 6 }: { players: Player[]; max?: number }) {
  const shown = players.slice(0, max);
  const hidden = players.length - shown.length;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((player, index) => (
        <PlayerAvatar key={player.id} player={player} size="sm" overlap={index > 0} />
      ))}
      {hidden > 0 ? (
        <Text variant="caption" tone="ink3" style={{ marginLeft: 6 }}>
          +{hidden}
        </Text>
      ) : null}
    </View>
  );
}
