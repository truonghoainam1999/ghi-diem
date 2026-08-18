import { Pressable, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Text } from './Text';

export interface IconButtonProps {
  /** Ký tự hiển thị: ‹ ⋯ ⚙ ↩ ✕ ↗. Đổi sang bộ icon thật thì chỉ sửa file này. */
  glyph: string;
  onPress?: () => void;
  label: string;
  size?: number;
  /**
   * Cỡ ký tự so với ô, mặc định 0.5. Mỗi ký tự có độ đậm khác nhau nên chỗ nào
   * trông mảnh thì chỉnh riêng — ⋯ cần to hơn ‹ mới cân nhau về mặt thị giác.
   */
  glyphScale?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

const useStyles = makeStyles((t) => ({
  base: {
    backgroundColor: t.color.raised,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.cell,
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.3 },
}));

export function IconButton({
  glyph,
  onPress,
  label,
  size = 34,
  glyphScale = 0.5,
  disabled,
  style,
}: IconButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      // Ô vẽ có thể nhỏ hơn 44 nhưng vùng chạm thì không.
      hitSlop={Math.max(0, (44 - size) / 2)}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        tone="ink"
        style={{ fontSize: size * glyphScale, lineHeight: size * 0.72, fontWeight: '700' }}
      >
        {glyph}
      </Text>
    </Pressable>
  );
}
