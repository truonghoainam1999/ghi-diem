import { useEffect, useId, useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, Text as RNText, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
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
  /** Thanh nhỏ nằm trên bàn phím số — chỗ duy nhất còn đặt được dấu âm. */
  accessory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: t.HIT,
    paddingHorizontal: t.GUTTER,
    backgroundColor: t.color.raised,
    borderTopWidth: 1,
    borderTopColor: t.color.line,
  },
  accessoryTap: { paddingVertical: t.space.sm, paddingHorizontal: t.space.sm },
  sign: { fontSize: 19, fontWeight: '600' },
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
 *
 * Gõ số thì hiện bàn phím số, không phải bàn phím chữ có hàng số: phím to, bấm
 * nhanh, đúng thứ thao tác này lặp lại nhiều nhất. Đổi lại bàn phím số của iOS
 * không có dấu trừ, nên dấu âm dời lên thanh phụ ngay trên bàn phím.
 */
export function Stepper({ value, onChange, step = 1, accessibilityLabel }: StepperProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const accessoryId = `stepper-sign-${useId()}`;

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

  /** Dấu âm: đổi ngay trên bản nháp nếu đang gõ dở, còn không thì lật cả giá trị. */
  function toggleSign() {
    if (draft === null) {
      onChange(-value);
      return;
    }
    setDraft(draft.startsWith('-') ? draft.slice(1) : `-${draft}`);
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
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        inputAccessoryViewID={Platform.OS === 'ios' ? accessoryId : undefined}
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

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đổi dấu âm dương"
              onPress={toggleSign}
              style={({ pressed }) => [styles.accessoryTap, pressed && styles.pressed]}
            >
              <Text style={styles.sign}>±</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => Keyboard.dismiss()}
              style={({ pressed }) => [styles.accessoryTap, pressed && styles.pressed]}
            >
              <Text variant="bodyStrong">Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}
