/**
 * Lấy ký tự cuối cùng người dùng gõ, tính theo cụm mà mắt thấy là "một ký tự".
 *
 * Không dùng `text.slice(-1)` hay `[...text].slice(-1)` được: rất nhiều emoji
 * gồm nhiều mã ghép lại — cờ là hai ký tự vùng, 👍🏽 là emoji cộng mã màu da,
 * 👨‍👩‍👧 là ba emoji nối bằng ký tự vô hình. Cắt theo mã sẽ xé chúng ra thành
 * mảnh vụn vô nghĩa.
 */
export function lastGrapheme(text: string): string {
  if (!text) return '';

  const segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (segmenter) {
    const segments = [...new segmenter('vi', { granularity: 'grapheme' }).segment(text)];
    return segments.length > 0 ? segments[segments.length - 1].segment : '';
  }

  // Máy không có Intl.Segmenter: giữ nguyên cả chuỗi còn hơn xé nhầm emoji.
  return text;
}
