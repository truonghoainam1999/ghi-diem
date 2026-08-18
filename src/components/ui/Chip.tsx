import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Text } from './Text';

const useStyles = makeStyles((t) => ({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  chip: {
    borderRadius: t.radius.chip,
    borderWidth: 1,
    borderColor: t.color.line2,
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.lg - 2,
    minHeight: 38,
    justifyContent: 'center',
  },
  selected: { backgroundColor: t.color.ink, borderColor: t.color.ink },
  pressed: { opacity: 0.7 },
}));

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text variant="body" tone={selected ? 'onInk' : 'ink2'} style={{ fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <View style={styles.wrap}>{children}</View>;
}
