import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

const useStyles = makeStyles((t) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: t.color.raised,
    borderRadius: t.radius.cell,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: t.space.sm + 1,
    borderRadius: t.radius.cell - 3,
    minHeight: 38,
  },
  selected: {
    backgroundColor: t.color.surface,
    // Giao diện đêm không đổ bóng được rõ nên dùng viền thay thế.
    borderWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: t.color.line2,
  },
}));

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text
              variant={selected ? 'bodyStrong' : 'body'}
              tone={selected ? 'ink' : 'ink2'}
              style={{ fontSize: 13.5 }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
