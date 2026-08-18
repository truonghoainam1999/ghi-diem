import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm + 2,
    paddingHorizontal: t.GUTTER,
    paddingTop: t.space.md,
    backgroundColor: t.color.bg,
    borderTopWidth: 1,
    borderTopColor: t.color.line,
  },
  stacked: { flexDirection: 'column', alignItems: 'stretch', gap: t.space.sm + 1 },
}));

/**
 * Thanh hành động dưới màn hình. Nền tràn hết mép máy, nội dung thì
 * đẩy lên trên vùng home indicator bằng inset thật thay vì số cố định.
 */
export function BottomBar({ children, stacked = false }: { children: ReactNode; stacked?: boolean }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, stacked && styles.stacked, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {children}
    </View>
  );
}
