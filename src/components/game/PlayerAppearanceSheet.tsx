import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { lastGrapheme } from '@/domain/text';
import type { PlayerDraft } from '@/domain/types';

import { PlayerAvatar } from './PlayerAvatar';

const useStyles = makeStyles((t) => ({
  head: { alignItems: 'center', paddingVertical: t.space.xs },
  block: { gap: t.space.sm + 2 },
  nameInput: {
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    backgroundColor: t.color.surface,
    paddingHorizontal: t.space.md,
    minHeight: t.HIT,
    fontSize: 15,
    color: t.color.ink,
  },
  /** Tám ô vừa đúng một hàng trên màn hẹp nhất: 8×36 + 7×8 = 344 < 354pt. */
  swatches: { flexDirection: 'row', gap: t.space.sm, justifyContent: 'space-between' },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchRing: { borderWidth: 3, borderColor: t.color.ink },
  emojiRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2 },
  emojiInput: {
    flex: 1,
    height: t.HIT + 6,
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    backgroundColor: t.color.surface,
    textAlign: 'center',
    fontSize: 26,
    color: t.color.ink,
  },
  clear: {
    height: t.HIT + 6,
    paddingHorizontal: t.space.lg,
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/**
 * Chỉnh diện mạo một người chơi: màu và icon.
 *
 * Icon lấy từ bàn phím emoji của máy chứ không phải một bộ icon dựng sẵn —
 * người dùng vốn đã có sẵn vài nghìn lựa chọn ở đó, dựng lại một danh sách con
 * chỉ làm hẹp đi. Cả hai đều không bắt buộc: bỏ trống thì màu gán tự động và
 * avatar dùng chữ cái đầu của tên.
 */
export function PlayerAppearanceSheet({
  visible,
  draft,
  onCancel,
  onSave,
}: {
  visible: boolean;
  draft: PlayerDraft | null;
  onCancel: () => void;
  onSave: (draft: PlayerDraft) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [emoji, setEmoji] = useState('');

  // Đọc draft qua ref chứ không đưa vào deps: nơi gọi thường dựng object mới
  // mỗi lần render, để trong deps thì effect chạy lại liên tục và xoá mất chữ
  // người dùng đang gõ. Chỉ nạp lại đúng lúc sheet mở ra.
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const current = draftRef.current;
    if (!visible || !current) return;
    setName(current.name);
    setColorIndex(current.colorIndex);
    setEmoji(current.emoji ?? '');
  }, [visible]);

  if (!draft) return null;

  const trimmedName = name.trim();
  const preview: PlayerDraft = {
    name: trimmedName || draft.name,
    colorIndex,
    emoji: emoji || undefined,
  };

  return (
    <Sheet visible={visible} onClose={onCancel}>
      <View style={styles.head}>
        <PlayerAvatar player={{ id: 'preview', ...preview }} size="lg" />
      </View>

      <View style={styles.block}>
        <Text variant="label" tone="ink3">
          Tên
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={draft.name}
          placeholderTextColor={theme.color.ink3}
          returnKeyType="done"
          style={styles.nameInput}
        />
      </View>

      <View style={styles.block}>
        <Text variant="label" tone="ink3">
          Màu
        </Text>
        <View style={styles.swatches}>
          {theme.playerColors.map((color, index) => (
            <Pressable
              key={color}
              accessibilityRole="button"
              accessibilityLabel={`Màu ${index + 1}`}
              accessibilityState={{ selected: index === colorIndex }}
              onPress={() => setColorIndex(index)}
              style={[styles.swatch, { backgroundColor: color }, index === colorIndex && styles.swatchRing]}
            />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Text variant="label" tone="ink3">
          Icon
        </Text>
        <View style={styles.emojiRow}>
          <TextInput
            value={emoji}
            // Chỉ giữ đúng một icon: ký tự vừa gõ thay cho ký tự cũ.
            onChangeText={(text) => setEmoji(lastGrapheme(text))}
            placeholder="🙂"
            placeholderTextColor={theme.color.ink3}
            style={styles.emojiInput}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setEmoji('')}
            style={({ pressed }) => [styles.clear, pressed && { opacity: 0.6 }]}
          >
            <Text tone="ink2">Bỏ icon</Text>
          </Pressable>
        </View>
        <Text variant="caption" tone="ink3">
          Chạm vào ô rồi chọn emoji trên bàn phím. Bỏ trống thì dùng chữ cái đầu của tên.
        </Text>
      </View>

      <Button label="Xong" disabled={!trimmedName} onPress={() => onSave(preview)} />
    </Sheet>
  );
}
