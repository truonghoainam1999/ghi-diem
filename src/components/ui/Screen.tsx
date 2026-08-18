import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.color.bg },
}));

/**
 * Nền và vùng an toàn cho mọi màn hình.
 * Phần dưới cố ý không cộng inset — thanh nút dưới tự lo, vì nó cần
 * nền tràn hết mép máy còn nội dung thì không.
 */
export function Screen({ children, edges = true }: { children: ReactNode; edges?: boolean }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return <View style={[styles.root, edges && { paddingTop: insets.top }]}>{children}</View>;
}
