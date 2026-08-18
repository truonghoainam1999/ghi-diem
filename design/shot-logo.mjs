import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'png-logo');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1160, height: 1200 }, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto('file://' + join(here, 'logo.html'), { waitUntil: 'networkidle' });
  const sfx = scheme === 'dark' ? '-dark' : '';
  await page.screenshot({ path: join(out, `logo${sfx}.png`), fullPage: true });
  await ctx.close();
}

await browser.close();
console.log('✓ logo → design/png-logo/');
