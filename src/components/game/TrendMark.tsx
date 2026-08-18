import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { TREND_WINDOW, type Trend } from '@/domain/scoring';
import { useTheme } from '@/theme/ThemeProvider';

const GLYPH: Record<Trend, string> = { rise: '↑', flat: '→', fall: '↓' };

const LABEL: Record<Trend, string> = {
  rise: `đang lên trong ${TREND_WINDOW} vòng gần nhất`,
  flat: `đi ngang trong ${TREND_WINDOW} vòng gần nhất`,
  fall: `đang xuống trong ${TREND_WINDOW} vòng gần nhất`,
};

/**
 * Mũi tên xu hướng dưới tổng điểm. Hướng mang nghĩa chính, màu chỉ nhấn thêm —
 * người mù màu vẫn phân biệt được lên, ngang, xuống.
 */
export function TrendMark({ trend, size = 13 }: { trend: Trend; size?: number }) {
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={LABEL[trend]}>
      {/* lineHeight bằng đúng fontSize để khung chữ ôm sát nét, không thừa khoảng trên dưới. */}
      <Text color={theme.trend[trend]} style={{ fontSize: size, fontWeight: '700', lineHeight: size }}>
        {GLYPH[trend]}
      </Text>
    </View>
  );
}
