import { Switch, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.space.md,
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.card,
    paddingVertical: t.space.md,
    paddingHorizontal: t.space.lg,
    minHeight: t.HIT + 12,
  },
  copy: { flex: 1, gap: 2 },
}));

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="ink3">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: theme.color.line2, true: theme.color.ink }}
        thumbColor={theme.color.surface}
        ios_backgroundColor={theme.color.line2}
      />
    </View>
  );
}
