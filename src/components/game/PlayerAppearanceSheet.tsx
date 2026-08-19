import { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { lastGrapheme } from '@/domain/text';
import type { PlayerDraft } from '@/domain/types';

import { PlayerAvatar } from './PlayerAvatar';

const SWATCH = 36;
const SWATCH_GAP = 8;

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
  /** Hàng màu tràn ra sát hai mép sheet, để thấy ngay là còn màu ở ngoài rìa. */
  swatchScroll: { marginHorizontal: -t.GUTTER },
  swatches: { flexDirection: 'row', gap: SWATCH_GAP, paddingHorizontal: t.GUTTER },
  swatch: { width: SWATCH, height: SWATCH, borderRadius: SWATCH / 2 },
  swatchRing: { borderWidth: 3, borderColor: t.color.ink },
  emojiRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2 },
  /**
   * Icon hiện ra bằng <Text> chứ không phải bằng chữ của chính ô nhập: lúc ô
   * được focus, iOS vẽ chữ theo line-height của font hệ thống, mà emoji lại
   * dùng font khác nên glyph bị đẩy lệch lên. Ô nhập nằm trong suốt phía trên
   * chỉ để gọi bàn phím, còn chỗ đứng của icon thì mình tự căn.
   */
  emojiBox: {
    flex: 1,
    height: t.HIT + 6,
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    backgroundColor: t.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Đang gõ: viền đậm lên thay cho con trỏ nháy đã ẩn. */
  emojiBoxFocused: { borderColor: t.color.ink },
  emojiGlyph: { fontSize: 26, lineHeight: 34 },
  emojiField: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    textAlign: 'center',
    fontSize: 26,
    color: 'transparent',
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
  const [focused, setFocused] = useState(false);

  // Nạp draft ngay trong lượt render lúc sheet mở ra, không đợi effect: hàng màu
  // cuộn tới màu đang chọn ngay ở lần đo đầu tiên, mà effect thì chạy sau khi đo
  // xong nên sẽ cuộn nhầm về màu 0. Chỉ nạp đúng lúc mở, để không xoá mất chữ
  // người dùng đang gõ ở những lượt render sau.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible && draft) {
      setName(draft.name);
      setColorIndex(draft.colorIndex);
      setEmoji(draft.emoji ?? '');
    }
  }

  const swatchList = useRef<ScrollView>(null);
  const scrolledToColor = useRef(false);

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
        <ScrollView
          ref={swatchList}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.swatchScroll}
          contentContainerStyle={styles.swatches}
          // Màu đang chọn có thể nằm ngoài rìa: kéo nó vào tầm mắt ngay khi mở,
          // chừa lại hai ô phía trước để thấy rõ nó nằm giữa một hàng dài.
          onContentSizeChange={() => {
            if (scrolledToColor.current) return;
            scrolledToColor.current = true;
            swatchList.current?.scrollTo({ x: Math.max(0, (colorIndex - 2) * (SWATCH + SWATCH_GAP)), animated: false });
          }}
        >
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
        </ScrollView>
      </View>

      <View style={styles.block}>
        <Text variant="label" tone="ink3">
          Icon
        </Text>
        <View style={styles.emojiRow}>
          <View style={[styles.emojiBox, focused && styles.emojiBoxFocused]}>
            <Text tone={emoji ? 'ink' : 'ink3'} style={styles.emojiGlyph}>
              {emoji || '🙂'}
            </Text>
            <TextInput
              value={emoji}
              // Chỉ giữ đúng một icon: ký tự vừa gõ thay cho ký tự cũ.
              onChangeText={(text) => setEmoji(lastGrapheme(text))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              caretHidden
              accessibilityLabel="Icon"
              style={styles.emojiField}
            />
          </View>
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
