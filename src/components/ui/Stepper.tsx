import { useEffect, useState } from 'react';
import { Platform, Pressable, Text as RNText, TextInput, View } from 'react-native';

import { formatScore } from '@/domain/layout';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs + 2 },
  button: {
    width: t.HIT,
    height: t.HIT,
    borderRadius: t.radius.cell,
    backgroundColor: t.color.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  glyph: { fontSize: 21, color: t.color.ink2 },
  input: {
    minWidth: 64,
    height: t.HIT,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
}));

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  accessibilityLabel?: string;
}

/**
 * Hai lối nhập song song, không bắt chọn chế độ:
 * bấm −/＋ cho điểm nhỏ, chạm thẳng vào con số để gõ số lớn.
 * Bấm − qua 0 là xuống số âm — nhiều game trừ điểm nên không chặn.
 */
export function Stepper({ value, onChange, step = 1, accessibilityLabel }: StepperProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [draft, setDraft] = useState<string | null>(null);

  // Khi điểm bị đổi từ ngoài (hoàn tác, xoá hết) mà ô đang gõ dở thì bỏ bản nháp.
  useEffect(() => {
    setDraft(null);
  }, [value]);

  const shown = draft ?? formatScore(value);

  function commit() {
    if (draft === null) return;
    const parsed = Number(draft.replace('−', '-').replace(',', '.'));
    onChange(Number.isFinite(parsed) ? Math.trunc(parsed) : 0);
    setDraft(null);
  }

  const tone = value === 0 ? theme.color.ink3 : value < 0 ? theme.color.danger : theme.color.ink;

  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Giảm điểm"
        onPress={() => onChange(value - step)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <RNText style={styles.glyph}>−</RNText>
      </Pressable>

      <TextInput
        value={shown}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        selectTextOnFocus
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
        returnKeyType="done"
        style={[styles.input, { color: tone, fontWeight: value === 0 ? '500' : '700' }]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tăng điểm"
        onPress={() => onChange(value + step)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <RNText style={styles.glyph}>＋</RNText>
      </Pressable>
    </View>
  );
}
