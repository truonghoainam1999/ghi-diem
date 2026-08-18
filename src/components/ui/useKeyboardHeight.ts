import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Chiều cao bàn phím đang chiếm, 0 khi bàn phím đóng.
 *
 * Dùng khi cần tự tính chỗ thay vì để KeyboardAvoidingView lo — nó chỉ thêm
 * padding, nên với panel có chiều cao cố định thì đẩy panel tràn khỏi màn hình.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // iOS báo trước khi bàn phím chạy hoạt ảnh, Android chỉ báo sau khi xong.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (event) => setHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
