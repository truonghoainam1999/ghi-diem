import { Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { TypeName } from '@/theme/tokens';

export type Tone = 'ink' | 'ink2' | 'ink3' | 'onInk' | 'danger';

export interface AppTextProps extends TextProps {
  variant?: TypeName;
  tone?: Tone;
  /** Màu tự do — dùng cho màu người chơi, thứ duy nhất nằm ngoài bảng tone. */
  color?: string;
}

/**
 * Mọi chữ trong app đi qua đây. Không dùng <Text> gốc của React Native,
 * để không có cỡ chữ hay màu nào lọt ra ngoài hệ token.
 */
export function Text({ variant = 'body', tone = 'ink', color, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  return <RNText style={[theme.typography[variant], { color: color ?? theme.color[tone] }, style]} {...rest} />;
}
