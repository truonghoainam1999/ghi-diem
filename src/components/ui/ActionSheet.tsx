import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';
import { ToggleRow } from './ToggleRow';

export interface SheetAction {
  label: string;
  onPress: () => void;
  /** Việc không hoàn tác được: xoá ván, xoá vòng. */
  destructive?: boolean;
}

/** Thiết lập bật/tắt tại chỗ — đổi xong sheet vẫn mở để thấy ngay kết quả. */
export interface SheetToggle {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const useStyles = makeStyles((t) => ({
  header: { alignItems: 'center', gap: 2, paddingBottom: t.space.xs },
  list: {
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.line,
    borderRadius: t.radius.card,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: t.space.lg,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: t.color.line },
  pressed: { backgroundColor: t.color.raised },
}));

/**
 * Menu tuỳ chọn dạng bottom sheet, thay cho Alert của hệ thống — Alert dùng
 * font, màu và bo góc của iOS/Android nên luôn lạc lõng giữa app.
 */
export function ActionSheet({
  visible,
  title,
  subtitle,
  toggles = [],
  actions,
  onClose,
}: {
  visible: boolean;
  title?: string;
  subtitle?: string;
  toggles?: SheetToggle[];
  actions: SheetAction[];
  onClose: () => void;
}) {
  const styles = useStyles();

  function run(action: SheetAction) {
    onClose();
    // Chờ sheet đóng hẳn rồi mới chạy: hành động thường mở tiếp một hộp xác
    // nhận, mà hộp đó bật lên giữa lúc modal đang trượt xuống thì bị che mất.
    setTimeout(action.onPress, 260);
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      {title ? (
        <View style={styles.header}>
          <Text variant="titleSheet" numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="ink3">
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Công tắc đứng trên danh sách hành động: nó là trạng thái, không phải việc để bấm rồi đóng. */}
      {toggles.map((toggle) => (
        <ToggleRow
          key={toggle.label}
          label={toggle.label}
          hint={toggle.hint}
          value={toggle.value}
          onChange={toggle.onChange}
        />
      ))}

      <View style={styles.list}>
        {actions.map((action, index) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={() => run(action)}
            style={({ pressed }) => [
              styles.row,
              index < actions.length - 1 && styles.divider,
              pressed && styles.pressed,
            ]}
          >
            <Text variant="body" tone={action.destructive ? 'danger' : 'ink'} style={{ fontSize: 16 }}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button label="Huỷ" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}
