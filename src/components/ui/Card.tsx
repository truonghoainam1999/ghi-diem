import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  base: {
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.card,
  },
  padded: { padding: t.space.lg, gap: t.space.md },
  /** Cho danh sách: lề ngang giữ nguyên, lề dọc do từng dòng tự lo. */
  flush: { paddingHorizontal: t.space.lg },
}));

export function Card({
  children,
  flush = false,
  style,
}: {
  children: ReactNode;
  flush?: boolean;
  style?: ViewStyle;
}) {
  const styles = useStyles();
  return <View style={[styles.base, flush ? styles.flush : styles.padded, style]}>{children}</View>;
}
