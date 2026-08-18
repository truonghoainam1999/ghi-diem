// Xuất wireframe + mockup ra PNG. Chạy: node design/shots.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();

/* ---------- 1. wireframe (bản khung, giữ lại để đối chiếu) ---------- */
{
  const out = join(here, 'png');
  mkdirSync(out, { recursive: true });
  const names = ['01-danh-sach-van', '02-tao-van-moi', '03-bang-diem', '04-nhap-diem', '05-ket-thuc'];

  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width: 1240, height: 1200 },
      deviceScaleFactor: 2,
      colorScheme: scheme,
    });
    const page = await ctx.newPage();
    await page.goto('file://' + join(here, 'wireframe-v1.html'), { waitUntil: 'networkidle' });
    const sfx = scheme === 'dark' ? '-dark' : '';
    await page.screenshot({ path: join(out, `00-tong-quan${sfx}.png`), fullPage: true });
    const phones = page.locator('.phone');
    for (let i = 0; i < names.length; i++) {
      await phones.nth(i).screenshot({ path: join(out, `${names[i]}${sfx}.png`) });
    }
    await ctx.close();
  }
  console.log('✓ wireframe → design/png/');
}

/* ---------- 2. mockup màu ---------- */
{
  const out = join(here, 'png-mockup');
  mkdirSync(out, { recursive: true });
  // .phone xuất hiện theo cặp ngày/đêm, đúng thứ tự trong file
  const names = [
    '01-bang-diem-ngay', '01-bang-diem-dem',
    '02-danh-sach-ngay', '02-danh-sach-dem',
    '03-van-moi-ngay', '03-van-moi-dem',
    '04-nhap-diem-ngay', '04-nhap-diem-dem',
    '05-ket-qua-ngay', '05-ket-qua-dem',
  ];

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1200 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  await page.goto('file://' + join(here, 'mockup-v1.html'), { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(out, '00-tat-ca.png'), fullPage: true });

  const phones = page.locator('.phone');
  const n = await phones.count();
  for (let i = 0; i < Math.min(n, names.length); i++) {
    await phones.nth(i).screenshot({ path: join(out, `${names[i]}.png`) });
  }
  await ctx.close();
  console.log(`✓ mockup → design/png-mockup/ (${Math.min(n, names.length)} màn hình)`);
}

await browser.close();
