import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/ThemeProvider';

import { useKeyboardHeight } from './useKeyboardHeight';

const useStyles = makeStyles((t) => ({
  /**
   * Nền mờ phải đủ tối để nội dung phía sau lùi hẳn ra sau. 0.32 vẫn đọc được
   * chữ bên dưới, mắt bị kéo qua lại giữa hai lớp và lẫn nội dung.
   */
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  /** Vùng tối phía trên: bấm vào là đóng, đồng thời đẩy panel xuống đáy. */
  scrim: { flex: 1 },
  panel: {
    backgroundColor: t.color.bg,
    borderTopLeftRadius: t.radius.sheet,
    borderTopRightRadius: t.radius.sheet,
    paddingHorizontal: t.GUTTER,
    paddingTop: t.space.sm + 1,
    gap: t.space.md + 1,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: t.color.line2,
    alignSelf: 'center',
  },
  /**
   * Sheet tự co theo nội dung: bàn phím mở làm maxHeight siết lại, mà flexShrink
   * trong React Native mặc định là 0 nên nội dung không co — nó tràn ra ngoài
   * panel và trông như bị lệch. Cho cuộn thì phần thừa trượt xuống đúng cách.
   */
  autoScroll: { flexGrow: 0, flexShrink: 1 },
  autoContent: { gap: t.space.md + 1 },
}));

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  /**
   * Tỉ lệ chiều cao màn hình mà sheet chiếm, ví dụ 0.8. Bỏ trống thì sheet
   * co theo nội dung nhưng không bao giờ trèo qua tai thỏ.
   */
  fill?: number;
  children: ReactNode;
}

/**
 * Khung chung cho mọi bottom sheet: nền mờ, bo góc trên, thanh nắm, và phần
 * tính chỗ cho bàn phím.
 *
 * KeyboardAvoidingView chỉ biết thêm padding nên với panel có chiều cao cố định
 * nó đẩy panel tràn khỏi màn hình. Ở đây tự đo bàn phím rồi vừa co chiều cao
 * vừa nhấc panel lên, nên sheet luôn nằm gọn giữa tai thỏ và bàn phím.
 */
export function Sheet({ visible, onClose, fill, children }: SheetProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();

  const headroom = screenHeight - insets.top - 12 - keyboardHeight;
  const sizing = fill ? { height: Math.min(screenHeight * fill, headroom) } : { maxHeight: headroom };
  const paddingBottom = keyboardHeight > 0 ? 16 : Math.max(insets.bottom, 16) + 16;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Đóng" />

        <View style={[styles.panel, sizing, { marginBottom: keyboardHeight, paddingBottom }]}>
          <View style={styles.handle} />
          {/* Sheet cao cố định tự lo phần cuộn bên trong; sheet tự co thì cuộn ở đây. */}
          {fill ? (
            children
          ) : (
            <ScrollView
              style={styles.autoScroll}
              contentContainerStyle={styles.autoContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
