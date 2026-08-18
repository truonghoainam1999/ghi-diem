import type { ReactNode } from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Text } from './Text';

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.space.md,
    paddingHorizontal: t.GUTTER,
    paddingTop: t.space.xs,
    paddingBottom: t.space.md,
  },
  /** Màn sheet không có safe-area đẩy xuống, nên tự chừa khoảng trên dưới cân nhau. */
  barLarge: { paddingTop: t.space.md + 2, paddingBottom: t.space.md + 4 },
  ruled: { borderBottomWidth: 1, borderBottomColor: t.color.line },
  center: { flex: 1, alignItems: 'center', gap: 2 },
  /** Hai bên rộng bằng nhau thì tiêu đề mới nằm giữa thật, kể cả khi một bên trống. */
  sideLeft: { minWidth: 64, alignItems: 'flex-start' },
  sideRight: { minWidth: 64, alignItems: 'flex-end' },
}));

export interface NavBarProps {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Tiêu đề lớn kiểu màn gốc, thay cho tiêu đề nhỏ căn giữa. */
  largeTitle?: string;
  ruled?: boolean;
  /**
   * 'sheet' cho màn mở từ dưới lên: chỉ nới khoảng trên dưới, cỡ chữ giữ nguyên
   * như mọi header khác — màn nào cũng là header, không có lý do to nhỏ khác nhau.
   */
  size?: 'nav' | 'sheet';
}

export function NavBar({ left, right, title, subtitle, largeTitle, ruled = false, size = 'nav' }: NavBarProps) {
  const styles = useStyles();
  const isSheet = size === 'sheet';

  if (largeTitle) {
    return (
      <View style={[styles.bar, ruled && styles.ruled]}>
        <Text variant="title" accessibilityRole="header">
          {largeTitle}
        </Text>
        {right}
      </View>
    );
  }

  return (
    <View style={[styles.bar, isSheet && styles.barLarge, ruled && styles.ruled]}>
      <View style={styles.sideLeft}>{left}</View>
      <View style={styles.center}>
        {title ? (
          <Text variant="titleNav" numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" tone="ink3">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.sideRight}>{right}</View>
    </View>
  );
}
