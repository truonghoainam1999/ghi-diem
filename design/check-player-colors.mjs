// Kiểm bảng màu người chơi trong src/theme/tokens.ts. Chạy: node design/check-player-colors.mjs
//
// Bốn phép kiểm, đúng những thứ bảng màu này phải giữ:
//   1. dải sáng   — mọi màu nằm trong một khoảng L* hẹp, không có màu nào nhảy ra
//   2. sàn sắc độ — không có màu nào nhạt tới mức thành màu xám
//   3. tách bạch  — ΔE2000 giữa mọi cặp, đo cả trên mắt thường lẫn ba kiểu mù màu
//   4. nền        — tương phản với nền của chính bản ngày/đêm
//
// Con số cần nhìn là "sàn": thêm hay đổi màu mà sàn tụt xuống dưới mức đang có
// nghĩa là vừa làm hai người chơi nào đó khó phân biệt hơn trước.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'theme', 'tokens.ts'), 'utf8');

function palette(scheme) {
  const block = src.match(new RegExp(`${scheme}: \\[([^\\]]*)\\]`, 's'));
  if (!block) throw new Error(`không tìm thấy bảng ${scheme} trong tokens.ts`);
  return [...block[1].matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0]);
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}
function rgbToHex(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToXyz(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  return [
    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    r * 0.0193339 + g * 0.119192 + b * 0.9503041,
  ];
}
const WP = [0.95047, 1, 1.08883];
function xyzToLab(xyz) {
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const [fx, fy, fz] = xyz.map((v, i) => f(v / WP[i]));
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const labOf = (hex) => xyzToLab(rgbToXyz(hexToRgb(hex)));
const chromaOf = (hex) => { const [, a, b] = labOf(hex); return Math.hypot(a, b); };
const hueOf = (hex) => { const [, a, b] = labOf(hex); return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360; };
const lightnessOf = (hex) => labOf(hex)[0];

/** CIEDE2000. */
function deltaE(hex1, hex2) {
  const [L1, a1, b1] = labOf(hex1);
  const [L2, a2, b2] = labOf(hex2);
  const kL = 1, kC = 1, kH = 1;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hp = (b, ap) => { if (b === 0 && ap === 0) return 0; const h = (Math.atan2(b, ap) * 180) / Math.PI; return h >= 0 ? h : h + 360; };
  const hp1 = hp(b1, ap1), hp2 = hp(b2, ap2);
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * Math.PI) / 360);
  const Lbp = (L1 + L2) / 2, Cbp = (Cp1 + Cp2) / 2;
  let hbp;
  if (Cp1 * Cp2 === 0) hbp = hp1 + hp2;
  else if (Math.abs(hp1 - hp2) <= 180) hbp = (hp1 + hp2) / 2;
  else hbp = hp1 + hp2 < 360 ? (hp1 + hp2 + 360) / 2 : (hp1 + hp2 - 360) / 2;
  const T = 1 - 0.17 * Math.cos(((hbp - 30) * Math.PI) / 180) + 0.24 * Math.cos((2 * hbp * Math.PI) / 180)
    + 0.32 * Math.cos(((3 * hbp + 6) * Math.PI) / 180) - 0.2 * Math.cos(((4 * hbp - 63) * Math.PI) / 180);
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin((2 * dTheta * Math.PI) / 180) * Rc;
  return Math.sqrt((dLp / (kL * Sl)) ** 2 + (dCp / (kC * Sc)) ** 2 + (dHp / (kH * Sh)) ** 2
    + Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)));
}

/** Mô phỏng mù màu theo Viénot–Brettel–Mollon (protan/deutan) và Brettel (tritan). */
const MATS = {
  protan: [[0.1121, 0.8853, -0.0005], [0.1127, 0.8897, -0.0001], [0.0045, 0.0085, 0.9913]],
  deutan: [[0.292, 0.7054, -0.0003], [0.2934, 0.7089, 0.0004], [-0.0195, 0.0333, 0.9861]],
  tritan: [[1.2547, -0.0777, -0.0011], [0.0, 0.9226, 0.0752], [-0.0259, 0.9576, 0.0693]],
};
function simulate(hex, kind) {
  if (kind === 'normal') return hex;
  const m = MATS[kind];
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const out = m.map((row) => row[0] * r + row[1] * g + row[2] * b);
  return rgbToHex(out.map(linearToSrgb));
}

function contrast(hex1, hex2) {
  const lum = (hex) => { const [r, g, b] = hexToRgb(hex).map(srgbToLinear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const [a, b] = [lum(hex1), lum(hex2)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

function minDeltaE(palette, kind) {
  let min = Infinity, pair = null;
  for (let i = 0; i < palette.length; i++)
    for (let j = i + 1; j < palette.length; j++) {
      const d = deltaE(simulate(palette[i], kind), simulate(palette[j], kind));
      if (d < min) { min = d; pair = [palette[i], palette[j]]; }
    }
  return { min, pair };
}

function report(name, palette, bgs) {
  const Ls = palette.map(lightnessOf), Cs = palette.map(chromaOf);
  const kinds = ['normal', 'protan', 'deutan', 'tritan'];
  const cvd = kinds.slice(1).map((k) => ({ k, ...minDeltaE(palette, k) }));
  const worstCvd = cvd.reduce((a, b) => (a.min < b.min ? a : b));
  const normal = minDeltaE(palette, 'normal');
  const contrasts = palette.flatMap((c) => bgs.map((bg) => contrast(c, bg)));
  console.log(`\n${name} — ${palette.length} màu`);
  console.log(`  L*        ${Math.min(...Ls).toFixed(1)} … ${Math.max(...Ls).toFixed(1)}`);
  console.log(`  sắc độ    tối thiểu ${Math.min(...Cs).toFixed(1)}`);
  console.log(`  ΔE thường tối thiểu ${normal.min.toFixed(1)}  (${normal.pair.join(' / ')})`);
  for (const c of cvd) console.log(`  ΔE ${c.k}  tối thiểu ${c.min.toFixed(1)}  (${c.pair.join(' / ')})`);
  console.log(`  ⇒ sàn mù màu ${worstCvd.min.toFixed(1)} (${worstCvd.k})`);
  console.log(`  tương phản nền ${Math.min(...contrasts).toFixed(2)} … ${Math.max(...contrasts).toFixed(2)}`);
  return { minCvd: worstCvd.min, minNormal: normal.min, minChroma: Math.min(...Cs), L: [Math.min(...Ls), Math.max(...Ls)] };
}

/** LCh(ab) → hex, trả null nếu rơi ra ngoài gam màu sRGB. */
function lchToHex(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const finv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (108 / 841) * (t - 4 / 29));
  const [X, Y, Z] = [finv(fx) * WP[0], finv(fy) * WP[1], finv(fz) * WP[2]];
  const lin = [
    X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314,
    X * -0.969266 + Y * 1.8760108 + Z * 0.041556,
    X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252,
  ];
  if (lin.some((v) => v < -0.0008 || v > 1.0008)) return null;
  return rgbToHex(lin.map((v) => linearToSrgb(Math.min(1, Math.max(0, v)))));
}

const SCHEMES = {
  'bản ngày': { colors: palette('light'), bg: ['#F4F4F0', '#FFFFFF'] },
  'bản đêm': { colors: palette('dark'), bg: ['#12161C', '#1A1F26'] },
};
const CVD = ['protan', 'deutan', 'tritan'];

for (const [name, { colors, bg }] of Object.entries(SCHEMES)) {
  const Ls = colors.map(lightnessOf);
  const Cs = colors.map(chromaOf);
  const normal = minDeltaE(colors, 'normal');
  const cvd = CVD.map((k) => ({ k, ...minDeltaE(colors, k) })).reduce((a, b) => (a.min < b.min ? a : b));
  const contrasts = colors.flatMap((c) => bg.map((b) => contrast(c, b)));

  // Hai màu kề nhau trên vòng gán (index % n) là hai người vào ván liền nhau.
  let ring = Infinity;
  for (let i = 0; i < colors.length; i++) {
    const j = (i + 1) % colors.length;
    for (const k of CVD) ring = Math.min(ring, deltaE(simulate(colors[i], k), simulate(colors[j], k)));
  }

  console.log(`\n${name} — ${colors.length} màu`);
  console.log(`  dải sáng        L* ${Math.min(...Ls).toFixed(1)} … ${Math.max(...Ls).toFixed(1)}`);
  console.log(`  sàn sắc độ      ${Math.min(...Cs).toFixed(1)}`);
  console.log(`  sàn mắt thường  ΔE ${normal.min.toFixed(1)}  (${normal.pair.join(' / ')})`);
  console.log(`  sàn mù màu      ΔE ${cvd.min.toFixed(1)}  ${cvd.k}  (${cvd.pair.join(' / ')})`);
  console.log(`  sàn cặp kề nhau ΔE ${ring.toFixed(1)}  (dưới mắt mù màu)`);
  console.log(`  tương phản nền  ${Math.min(...contrasts).toFixed(2)} … ${Math.max(...contrasts).toFixed(2)}`);
}
