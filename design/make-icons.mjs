/**
 * Xuất bộ icon từ logo phương án 02 vào assets/.
 * Chạy lại: node design/make-icons.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'assets');

const INK_DARK = '#12161C';
const INK_LIGHT = '#F0F2F5';

/** Ký hiệu, vẽ trong khung 100×100. Sửa ở đây thì mọi icon đổi theo. */
const MARK = `
  <g stroke="COLOR" stroke-width="10" stroke-linecap="round" fill="none">
    <line x1="14" y1="50" x2="86" y2="50"/>
    <line x1="42" y1="24" x2="58" y2="24"/>
    <line x1="50" y1="16" x2="50" y2="32"/>
    <line x1="43" y1="69" x2="57" y2="83"/>
    <line x1="57" y1="69" x2="43" y2="83"/>
  </g>`;

/**
 * @param size    cạnh ảnh, pixel
 * @param scale   ký hiệu chiếm bao nhiêu phần cạnh — Android che góc nên phải nhỏ hơn
 * @param bg      màu nền, null nghĩa là nền trong suốt
 */
function page({ size, scale, color, bg }) {
  const box = size * scale;
  const offset = (size - box) / 2;
  return `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;${
    bg ? `background:${bg}` : ''
  }">
    <svg width="${box}" height="${box}" viewBox="0 0 100 100" style="position:absolute;left:${offset}px;top:${offset}px">
      ${MARK.replace('COLOR', color)}
    </svg>
  </body></html>`;
}

const TARGETS = [
  // iOS: nền tối vì giao diện tối là mặc định của app.
  { file: 'icon.png', size: 1024, scale: 0.62, color: INK_LIGHT, bg: INK_DARK },

  // Splash: app.json đã đặt nền #12161C, nên ảnh này để trong suốt.
  { file: 'splash-icon.png', size: 1024, scale: 0.34, color: INK_LIGHT, bg: null },

  { file: 'favicon.png', size: 48, scale: 0.68, color: INK_LIGHT, bg: INK_DARK },

  // Android adaptive: nền và hình tách rời, hệ điều hành tự ghép rồi cắt theo
  // mặt nạ của máy. Vùng an toàn chỉ là 66% ở giữa nên hình phải co lại nhiều.
  { file: 'android-icon-background.png', size: 512, scale: 0, color: INK_DARK, bg: INK_DARK },
  { file: 'android-icon-foreground.png', size: 512, scale: 0.42, color: INK_LIGHT, bg: null },

  // Bản đơn sắc cho icon theo chủ đề của Android 13+: chỉ hình, không nền.
  { file: 'android-icon-monochrome.png', size: 432, scale: 0.42, color: '#FFFFFF', bg: null },
];

const browser = await chromium.launch();

for (const target of TARGETS) {
  const ctx = await browser.newContext({
    viewport: { width: target.size, height: target.size },
    deviceScaleFactor: 1,
  });
  const tab = await ctx.newPage();
  await tab.setContent(page(target));
  await tab.screenshot({
    path: join(assets, target.file),
    omitBackground: target.bg === null,
  });
  await ctx.close();
  console.log(`✓ ${target.file}  ${target.size}×${target.size}`);
}

await browser.close();
