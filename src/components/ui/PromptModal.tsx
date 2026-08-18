import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme/ThemeProvider';

import { Button } from './Button';
import { Text } from './Text';

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
    padding: t.space.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: t.color.bg,
    borderRadius: t.radius.sheet,
    padding: t.space.xl,
    gap: t.space.md + 2,
  },
  input: {
    borderWidth: 1,
    borderColor: t.color.line2,
    borderRadius: t.radius.button,
    paddingHorizontal: t.space.md,
    minHeight: t.HIT,
    fontSize: 15,
    color: t.color.ink,
    backgroundColor: t.color.surface,
  },
  actions: { flexDirection: 'row', gap: t.space.sm + 2 },
}));

/** Hộp nhập một dòng. Alert.prompt chỉ có trên iOS nên không dùng được. */
export function PromptModal({
  visible,
  title,
  placeholder,
  confirmLabel = 'Xong',
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <Text variant="titleNav">{title}</Text>
            <TextInput
              autoFocus
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={theme.color.ink3}
              onSubmitEditing={() => value.trim() && onConfirm(value.trim())}
              returnKeyType="done"
              style={styles.input}
            />
            <View style={styles.actions}>
              <Button label="Huỷ" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
              <Button
                label={confirmLabel}
                disabled={!value.trim()}
                onPress={() => onConfirm(value.trim())}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
