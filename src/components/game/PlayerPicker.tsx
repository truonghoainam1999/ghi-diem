import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { PLAYER_COLOR_COUNT } from '@/theme/tokens';
import type { PlayerDraft } from '@/domain/types';

import { PlayerAppearanceSheet } from './PlayerAppearanceSheet';
import { PlayerAvatar } from './PlayerAvatar';

const useStyles = makeStyles((t) => ({
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    paddingVertical: t.space.md + 2,
    paddingHorizontal: t.space.md,
    alignItems: 'center',
    minHeight: t.HIT,
    justifyContent: 'center',
  },
  input: { flex: 1, fontSize: 15, color: t.color.ink, paddingVertical: t.space.md, minHeight: t.HIT },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    paddingHorizontal: t.space.md,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2, flex: 1 },
}));

export function PlayerPicker({
  players,
  onChange,
}: {
  players: PlayerDraft[];
  onChange: (players: PlayerDraft[]) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const chosen = new Set(players.map((player) => player.name.toLocaleLowerCase('vi')));

  // Bấm "Thêm" trong lúc ô đang focus làm onBlur và onPress cùng chạy trong một
  // nhịp. Ghi vào ref ngay lập tức để lần gọi thứ hai không thêm trùng tên.
  const addedRef = useRef(chosen);
  addedRef.current = chosen;

  function add(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = trimmed.toLocaleLowerCase('vi');
    if (addedRef.current.has(key)) return;
    addedRef.current.add(key);
    // Màu gán tự động theo thứ tự vào ván; đổi được sau bằng cách chạm vào dòng.
    onChange([...players, { name: trimmed, colorIndex: players.length % PLAYER_COLOR_COUNT }]);
    setDraft('');
  }

  function replaceAt(index: number, next: PlayerDraft) {
    onChange(players.map((player, i) => (i === index ? next : player)));
  }

  return (
    <View style={{ gap: theme.space.md }}>
      {players.length > 0 ? (
        <Card flush>
          {players.map((player, index) => (
            <ListRow
              key={`${player.name}-${index}`}
              last={index === players.length - 1}
              onPress={() => setEditingIndex(index)}
              accessibilityLabel={`Sửa `}
              left={
                <View style={styles.who}>
                  <PlayerAvatar player={{ id: `draft-${index}`, ...player }} size="sm" />
                  <Text numberOfLines={1}>{player.name}</Text>
                </View>
              }
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.lg }}>
                  <Text variant="caption" tone="ink3">
                    Sửa
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Bỏ ${player.name}`}
                    hitSlop={12}
                    onPress={() => onChange(players.filter((_, i) => i !== index))}
                  >
                    <Text tone="ink3">✕</Text>
                  </Pressable>
                </View>
              }
            />
          ))}
        </Card>
      ) : null}

      {adding ? (
        <View style={styles.inputRow}>
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => add(draft)}
            onBlur={() => {
              add(draft);
              setAdding(false);
            }}
            placeholder="Tên người chơi"
            placeholderTextColor={theme.color.ink3}
            returnKeyType="done"
            style={styles.input}
          />
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => add(draft)}>
            <Text tone="ink2">Thêm</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setAdding(true)}
          style={({ pressed }) => [styles.dashed, pressed && { opacity: 0.6 }]}
        >
          <Text tone="ink3">＋ Thêm người chơi</Text>
        </Pressable>
      )}

      <PlayerAppearanceSheet
        visible={editingIndex !== null}
        draft={editingIndex === null ? null : players[editingIndex]}
        onCancel={() => setEditingIndex(null)}
        onSave={(next) => {
          if (editingIndex !== null) replaceAt(editingIndex, next);
          setEditingIndex(null);
        }}
      />
    </View>
  );
}
