import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { Player } from '@/domain/types';

/** Chữ cái đầu là thứ định danh chính; màu chỉ hỗ trợ, vì người thứ 9 dùng lại màu 1. */
export function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed[0].toLocaleUpperCase('vi');
}

export type AvatarSize = 'sm' | 'md' | 'lg';

const DIAMETER: Record<AvatarSize, number> = { sm: 24, md: 30, lg: 56 };
const FONT: Record<AvatarSize, number> = { sm: 11, md: 13, lg: 23 };

export function usePlayerColor(player: Player): string {
  const theme = useTheme();
  return theme.playerColors[player.colorIndex % theme.playerColors.length];
}

export function PlayerAvatar({
  player,
  size = 'md',
  overlap = false,
}: {
  player: Player;
  size?: AvatarSize;
  overlap?: boolean;
}) {
  const theme = useTheme();
  const color = usePlayerColor(player);
  const diameter = DIAMETER[size];

  // Có emoji thì bỏ hẳn nền màu: emoji tự nó đã đủ đậm, đặt trên nền màu nữa
  // là hai thứ tranh nhau và chữ số bên cạnh khó đọc.
  if (player.emoji) {
    return (
      <View
        accessible
        accessibilityLabel={player.name}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: theme.color.raised,
          borderWidth: overlap ? 2 : 1.5,
          borderColor: overlap ? theme.color.surface : color,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: overlap ? -10 : 0,
        }}
      >
        <Text style={{ fontSize: diameter * 0.55, lineHeight: diameter * 0.72 }}>{player.emoji}</Text>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={player.name}
      style={{
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: overlap ? -10 : 0,
        // Chồng avatar cần viền cùng màu nền để tách khỏi cái phía sau.
        borderWidth: overlap ? 2 : 0,
        borderColor: theme.color.surface,
      }}
    >
      <Text color={theme.color.onInk} style={{ fontSize: FONT[size], fontWeight: '700' }}>
        {initialOf(player.name)}
      </Text>
    </View>
  );
}
