import type { TextStyle } from 'react-native';

/**
 * Token thiết kế — nguồn sự thật duy nhất về màu, chữ, khoảng cách.
 * Đồng bộ với design/mockup-v1.html. Sửa ở đây thì sửa cả bên đó.
 */

export type SchemeName = 'light' | 'dark';

/**
 * Ba bậc chữ, đo trên nền khó đọc nhất trong ba nền (bg, surface, raised).
 * Ngưỡng WCAG AA cho chữ nhỏ là 4.5:1; ở đây đặt cao hơn nhiều vì app hay được
 * đặt giữa bàn và nhìn nghiêng từ xa, lúc đó tương phản vừa đủ là không đủ.
 *
 *   ngày   ink 13.7 · ink2 7.0 · ink3 4.7
 *   đêm    ink 13.1 · ink2 9.6 · ink3 7.0
 *
 * Bản đêm để cao hơn hẳn: chữ sáng trên nền tối trông mảnh hơn chữ tối trên nền
 * sáng cùng tương phản, nên cùng con số mà đọc vẫn thấy nhạt hơn.
 *
 * ink3 gánh chú thích, nhãn và trục biểu đồ — toàn chữ 10–13pt, nên nó là bậc
 * phải canh kỹ nhất chứ không phải bậc được phép nhạt nhất.
 */
export interface ColorSet {
  bg: string;
  surface: string;
  raised: string;
  /**
   * Hai bậc đường kẻ, đo giữa hai nền mà nó nằm chen vào (bg và surface):
   * line ~2.2:1 cho viền thẻ và gạch ngăn, line2 ~3:1 cho viền ô nhập, chip,
   * mép sheet — những thứ người dùng chạm vào nên phải thấy rõ ranh giới.
   *
   * Ở bản đêm hai giá trị cũ chỉ đạt 1.19 và 1.60, tức gần như tàng hình.
   */
  line: string;
  line2: string;
  ink: string;
  ink2: string;
  ink3: string;
  onInk: string;
  danger: string;
}

const colors: Record<SchemeName, ColorSet> = {
  light: {
    bg: '#F4F4F0',
    surface: '#FFFFFF',
    raised: '#EBEBE6',
    line: '#B3B3AE',
    line2: '#8D8D87',
    ink: '#16202E',
    ink2: '#434F5A',
    ink3: '#606974',
    onInk: '#FFFFFF',
    danger: '#B5302B',
  },
  dark: {
    bg: '#12161C',
    surface: '#1A1F26',
    raised: '#232931',
    line: '#4E565E',
    line2: '#606A75',
    ink: '#F0F2F5',
    ink2: '#C8D2DE',
    ink3: '#A9B5C1',
    onInk: '#12161C',
    danger: '#F6867E',
  },
};

/**
 * Màu ngữ nghĩa cho xu hướng điểm. Tách khỏi màu người chơi: cái kia nói
 * "ai", cái này nói "đang thế nào" — trộn vào nhau là mất cả hai nghĩa.
 */
export interface TrendColors {
  rise: string;
  flat: string;
  fall: string;
}

const trendColors: Record<SchemeName, TrendColors> = {
  light: { rise: '#2C7A4B', flat: '#A8760A', fall: '#B5302B' },
  dark: { rise: '#63B98A', flat: '#D9A441', fall: '#E0736C' },
};

/** Vàng, bạc, đồng cho ba hạng đầu ở màn kết quả. */
export interface MedalColors {
  gold: string;
  silver: string;
  bronze: string;
}

const medalColors: Record<SchemeName, MedalColors> = {
  light: { gold: '#C08A16', silver: '#7E8B95', bronze: '#A2632C' },
  dark: { gold: '#E0B44F', silver: '#AFBAC3', bronze: '#C98A50' },
};

/**
 * Mười sáu màu người chơi, gán theo thứ tự vào ván: playerColors[index % 16].
 * Chỉ dùng cho avatar, viền, gạch chân, đường biểu đồ — không tô nền lớn.
 *
 * Thứ tự này không phải xếp cho đẹp: nó được dò để hai màu cạnh nhau (tức hai
 * người vào ván liền nhau) cách xa nhau nhất dưới mắt mù màu. Bản đêm giữ
 * nguyên sắc độ và giữ nguyên tương quan sáng-tối, chỉ dời cả dải lên cho hợp
 * nền tối — san bằng độ sáng sẽ làm đỏ và cam dính vào nhau.
 *
 * Tám màu đầu là bảng cũ, giữ nguyên cả giá trị lẫn thứ tự vì màu đã lưu trong
 * ván cũ là chỉ số vào mảng này. Tám màu sau được dò thêm với ràng buộc: không
 * kéo sàn mù màu xuống thấp hơn bảng cũ, nằm trong đúng dải sáng và sàn sắc độ
 * cũ, tương phản nền ≥ 3.2, và xếp sao cho vòng gán màu vẫn giữ nguyên sàn.
 *
 * Đổi màu nào thì chạy lại `node design/check-player-colors.mjs` trước khi ship.
 */
const playerColors: Record<SchemeName, readonly string[]> = {
  light: [
    '#2F6FA8', '#1E8449', '#7D3FA8', '#7A6A12', '#0A90A0', '#B5302B', '#C07408', '#C0327A',
    '#8377EA', '#6D9100', '#BD5CC5', '#D85F31', '#9C4900', '#4B55C2', '#E54661', '#4A6A00',
  ],
  dark: [
    '#1E80CF', '#229854', '#944BC7', '#8D7B1B', '#269FAF', '#D23A34', '#CE8123', '#D4448A',
    '#9083FF', '#79A006', '#D36ADB', '#EF6C3A', '#B25709', '#5B64DA', '#FE536F', '#587B09',
  ],
};

export const PLAYER_COLOR_COUNT = playerColors.light.length;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { chip: 999, cell: 11, button: 14, card: 16, sheet: 22 } as const;

/** Ngưỡng chạm tối thiểu của iOS. Không co nhỏ hơn ở bất kỳ đâu. */
export const HIT = 44;

/** Lề trái/phải của mọi màn hình. */
export const GUTTER = 18;

/** Bật ở mọi chỗ hiện số — không có nó thì cột điểm nhảy khi số đổi. */
export const numeric: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  scoreHero: { fontSize: 46, fontWeight: '700', letterSpacing: -1.6, ...numeric },
  scoreTotal: { fontSize: 23, fontWeight: '700', letterSpacing: -0.7, ...numeric },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.65 },
  /** Tiêu đề của màn mở dạng sheet — to hơn nav thường vì không có nút back dẫn dắt. */
  titleSheet: { fontSize: 21, fontWeight: '700', letterSpacing: -0.42 },
  titleNav: { fontSize: 17, fontWeight: '600', letterSpacing: -0.17 },
  body: { fontSize: 15 },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  cell: { fontSize: 15.5, ...numeric },
  caption: { fontSize: 13 },
  label: { fontSize: 11.5, fontWeight: '600', letterSpacing: 1.04, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TypeName = keyof typeof typography;

export interface Theme {
  scheme: SchemeName;
  color: ColorSet;
  trend: TrendColors;
  medal: MedalColors;
  playerColors: readonly string[];
  space: typeof space;
  radius: typeof radius;
  typography: typeof typography;
  HIT: number;
  GUTTER: number;
}

export function makeTheme(scheme: SchemeName): Theme {
  return {
    scheme,
    color: colors[scheme],
    trend: trendColors[scheme],
    medal: medalColors[scheme],
    playerColors: playerColors[scheme],
    space,
    radius,
    typography,
    HIT,
    GUTTER,
  };
}
