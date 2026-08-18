import { useThemeMode } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/storage/themeRepository';

import { IconButton } from './IconButton';

const GLYPH: Record<ThemeMode, string> = { auto: '◐', light: '☀', dark: '☾' };

const LABEL: Record<ThemeMode, string> = {
  auto: 'Giao diện theo máy, chạm để chuyển sang sáng',
  light: 'Giao diện sáng, chạm để chuyển sang tối',
  dark: 'Giao diện tối, chạm để theo máy',
};

/**
 * Một nút, ba trạng thái: theo máy → sáng → tối → theo máy.
 *
 * Giữ "theo máy" trong vòng lặp chứ không chỉ bật/tắt hai chiều — đó là mặc
 * định của hệ điều hành, bỏ đi thì người dùng chọn nhầm một lần là không có
 * đường quay lại.
 */
export function ThemeToggle() {
  const { mode, cycleMode } = useThemeMode();

  return <IconButton glyph={GLYPH[mode]} label={LABEL[mode]} glyphScale={0.5} onPress={cycleMode} />;
}
