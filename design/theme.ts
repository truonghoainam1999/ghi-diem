/**
 * Design tokens cho app Ghi Điểm.
 * Xuất trực tiếp từ design/mockup-v1.html — sửa ở đây thì sửa cả bên đó.
 *
 *   import { useColorScheme } from 'react-native';
 *   import { makeTheme } from './theme';
 *
 *   const t = makeTheme(useColorScheme());
 */

export type Scheme = 'light' | 'dark' | null | undefined;

const palette = {
  light: {
    bg: '#F4F4F0',
    surface: '#FFFFFF',
    raised: '#EBEBE6',
    line: '#E1E1DB',
    line2: '#C9C9C2',
    ink: '#16202E',
    ink2: '#5A6672',
    ink3: '#8D97A2',
    onInk: '#FFFFFF',
    danger: '#B5302B',
  },
  dark: {
    bg: '#12161C',
    surface: '#1A1F26',
    raised: '#232931',
    line: '#262D35',
    line2: '#38414B',
    ink: '#E9EBEE',
    ink2: '#98A2AE',
    ink3: '#6B7581',
    onInk: '#12161C',
    danger: '#E0736C',
  },
} as const;

/**
 * Màu người chơi, gán theo thứ tự vào ván: player[index % 8].
 * Tám màu này khác nhau cả về độ sáng lẫn sắc độ nên phân biệt được
 * với mắt mù màu đỏ–lục. Chỉ dùng cho avatar, viền, gạch chân —
 * không tô nền lớn, sẽ làm con số khó đọc.
 */
const players = {
  light: ['#2F6FA8', '#B5302B', '#3B7D57', '#B8721A', '#74499E', '#1B838D', '#B03E77', '#55606D'],
  dark: ['#6FA8DA', '#E4736C', '#6FB58C', '#DFA451', '#AE87D4', '#4FB9C2', '#DE7BAC', '#98A2B0'],
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { chip: 999, cell: 11, button: 14, card: 16, sheet: 22 } as const;

/** Ngưỡng chạm tối thiểu của iOS. Không co nhỏ hơn ở bất kỳ đâu. */
export const HIT = 44;

/** Lề trái/phải của mọi màn hình. */
export const GUTTER = 18;

/** Bề rộng cột "Vòng" trong bảng điểm. */
export const ROUND_COL = 34;

/** Bề rộng tối thiểu một cột người chơi trước khi bảng phải cuộn ngang. */
export const MIN_PLAYER_COL = 44;

export const type = {
  scoreHero: { fontSize: 46, fontWeight: '700', letterSpacing: -1.6 },
  scoreTotal: { fontSize: 23, fontWeight: '700', letterSpacing: -0.7 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.65 },
  titleNav: { fontSize: 17, fontWeight: '600', letterSpacing: -0.17 },
  body: { fontSize: 15, fontWeight: '400' },
  cell: { fontSize: 15.5, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  label: { fontSize: 11.5, fontWeight: '600', letterSpacing: 1.04, textTransform: 'uppercase' },
} as const;

/** Bật ở MỌI chỗ hiện số, nếu không thì cột điểm nhảy khi số đổi. */
export const NUMERIC = { fontVariant: ['tabular-nums' as const] };

/** Dấu trừ U+2212 — rộng bằng chữ số nên cột vẫn thẳng hàng. */
export const MINUS = '−';

export function formatScore(n: number): string {
  return n < 0 ? MINUS + Math.abs(n) : String(n);
}

/** Cỡ chữ tổng điểm co lại khi bàn đông người. */
export function scoreFontSize(playerCount: number): number {
  if (playerCount <= 5) return 23;
  if (playerCount <= 7) return 20;
  return 17;
}

/** Bảng điểm chỉ cuộn ngang khi cột hẹp hơn ngưỡng tối thiểu. */
export function needsHorizontalScroll(playerCount: number, screenWidth: number): boolean {
  const available = screenWidth - ROUND_COL;
  return available / playerCount < MIN_PLAYER_COL;
}

export function makeTheme(scheme: Scheme) {
  const key = scheme === 'dark' ? 'dark' : 'light';
  return {
    scheme: key,
    color: palette[key],
    player: players[key],
    space,
    radius,
    type,
    HIT,
    GUTTER,
    ROUND_COL,
    MIN_PLAYER_COL,
    NUMERIC,
    scoreFontSize,
    needsHorizontalScroll,
    formatScore,
  };
}

export type Theme = ReturnType<typeof makeTheme>;
