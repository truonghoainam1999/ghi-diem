/** Ký tự nối: đứng sau một cụm thì thuộc về cụm đó chứ không mở cụm mới. */
function isJoiner(cp: number): boolean {
  return (
    cp === 0x200d || // ZWJ — nối 👨‍👩‍👧 thành một hình
    cp === 0xfe0f || // chọn kiểu vẽ màu
    cp === 0xfe0e || // chọn kiểu vẽ đen trắng
    cp === 0x20e3 || // khung phím số của 1️⃣
    (cp >= 0x1f3fb && cp <= 0x1f3ff) || // mã màu da của 👍🏽
    (cp >= 0xe0020 && cp <= 0xe007f) || // mã vùng của cờ 🏴󠁧󠁢󠁥󠁮󠁧󠁿
    // Dấu tổ hợp: chữ Việt gõ rời thành chữ cái + dấu.
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0x1ab0 && cp <= 0x1aff) ||
    (cp >= 0x1dc0 && cp <= 0x1dff) ||
    (cp >= 0x20d0 && cp <= 0x20ff) ||
    (cp >= 0xfe20 && cp <= 0xfe2f)
  );
}

function isRegionalIndicator(cp: number): boolean {
  return cp >= 0x1f1e6 && cp <= 0x1f1ff;
}

/**
 * Lấy ký tự cuối cùng người dùng gõ, tính theo cụm mà mắt thấy là "một ký tự".
 *
 * Không dùng `text.slice(-1)` hay `[...text].slice(-1)` được: rất nhiều emoji
 * gồm nhiều mã ghép lại — cờ là hai ký tự vùng, 👍🏽 là emoji cộng mã màu da,
 * 👨‍👩‍👧 là ba emoji nối bằng ký tự vô hình. Cắt theo mã sẽ xé chúng ra thành
 * mảnh vụn vô nghĩa.
 *
 * Tự gom cụm chứ không nhờ `Intl.Segmenter`: Hermes không có nó, mà nhánh dự
 * phòng "trả nguyên chuỗi" thì hỏng đúng thứ ô icon cần — chọn icon thứ hai sẽ
 * dính cả icon cũ. Luật dưới đây chỉ gom quanh các mã nối nên hai emoji rời
 * nhau không bao giờ bị dính vào nhau.
 */
export function lastGrapheme(text: string): string {
  if (!text) return '';

  const clusters: string[] = [];
  let afterZwj = false;

  for (const char of text) {
    const cp = char.codePointAt(0) as number;
    const last = clusters[clusters.length - 1];

    // Hai ký tự vùng liền nhau là một lá cờ; ký tự vùng thứ ba mở cờ mới.
    const opensFlag =
      last !== undefined &&
      isRegionalIndicator(cp) &&
      [...last].length === 1 &&
      isRegionalIndicator(last.codePointAt(0) as number);

    if (last !== undefined && (afterZwj || isJoiner(cp) || opensFlag)) {
      clusters[clusters.length - 1] = last + char;
    } else {
      clusters.push(char);
    }

    afterZwj = cp === 0x200d;
  }

  return clusters[clusters.length - 1] ?? '';
}
