import { Pressable, type PressableProps, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.button,
    paddingVertical: t.space.lg,
    paddingHorizontal: t.space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: t.HIT + 8,
  },
  primary: { backgroundColor: t.color.ink },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.color.line2 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
}));

export function Button({ label, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Text variant="bodyStrong" tone={variant === 'primary' ? 'onInk' : 'ink2'} style={{ fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}
