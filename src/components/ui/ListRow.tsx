import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.space.md,
    paddingVertical: t.space.md,
    minHeight: t.HIT,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: t.color.line },
  pressed: { opacity: 0.6 },
}));

export interface ListRowProps {
  left: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  /** Dòng cuối bỏ gạch ngăn. React Native không có :last-child nên phải truyền tay. */
  last?: boolean;
  accessibilityLabel?: string;
}

export function ListRow({ left, right, onPress, last = false, accessibilityLabel }: ListRowProps) {
  const styles = useStyles();
  const content = (
    <>
      {left}
      {right}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, !last && styles.divider]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}
