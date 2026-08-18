import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Tổng thời gian bắn, tính từ quả đầu rời mặt đất tới lúc quả cuối tắt hẳn. */
const TOTAL_MS = 5000;

const PARTICLES_PER_BURST = 12;

const LAUNCH_MS = 620;
const BURST_MS = 1000;

/**
 * Bắn theo loạt 3–2 xen kẽ, tổng 20 quả. Bắn từng quả một thì thưa và đều đặn
 * như đồng hồ; đi theo loạt thì có nhịp dồn dập.
 */
const VOLLEYS = [3, 2, 3, 2, 3, 2, 3, 2];

/** Bệ phóng: hai góc dưới và giữa màn hình, tính theo tỉ lệ bề ngang. */
const PADS = [0.1, 0.5, 0.9];

/** Rải đều sao cho loạt cuối vừa kịp tắt ở mốc 5 giây. */
const VOLLEY_GAP_MS = (TOTAL_MS - LAUNCH_MS - BURST_MS) / (VOLLEYS.length - 1);

/** Lệch nhau vài chục mili giây trong cùng loạt, để không lên đều tăm tắp như máy. */
const WITHIN_VOLLEY_MS = 90;

/** Rơi thêm xuống ở cuối quỹ đạo, để tàn pháo có sức nặng thay vì toả đều như hoa văn. */
const GRAVITY = 46;

interface Particle {
  dx: number;
  dy: number;
  size: number;
}

interface Rocket {
  /** Chỗ rời mặt đất, ở một trong các bệ phóng dưới màn hình. */
  launchX: number;
  /** Chỗ nổ — chếch vào trong so với bệ phóng, nên quả bay theo đường xiên. */
  burstX: number;
  /** Độ cao nổ, tính từ mép trên. */
  burstY: number;
  delay: number;
  color: string;
  particles: Particle[];
}

/**
 * Pháo hoa mừng lúc xong ván: bay lên từ mép dưới rồi nổ bung ra tàn nhỏ.
 *
 * Vẽ bằng View thường và Animated chứ không thêm thư viện: chỉ cần transform và
 * opacity nên chạy được hết trên native driver — mượt kể cả khi luồng JS đang bận.
 * Mỗi quả chỉ có hai Animated.Value (bay và nổ), 16 tàn suy ra từ đó bằng
 * interpolate, nên cả màn pháo hoa vẫn chỉ có 16 giá trị thật sự chạy.
 */
export function Fireworks({ onDone }: { onDone?: () => void }) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  // Người bật "giảm chuyển động" thì bỏ hẳn, không thay bằng hiệu ứng nhẹ hơn:
  // họ tắt là vì chuyển động gây khó chịu, không phải vì thấy nó thừa.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!cancelled) setEnabled(!reduced);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rockets = useMemo<Rocket[]>(() => {
    const colors = theme.playerColors;
    const centerX = width / 2;

    return VOLLEYS.flatMap((size, volleyIndex) => {
      // Loạt 3 quả dùng cả ba bệ; loạt 2 quả chỉ hai góc, chừa giữa cho đỡ trùng nhịp.
      const pads = size === 3 ? PADS : [PADS[0], PADS[2]];

      return pads.map((pad) => {
        const launchX = width * pad;
        // Chệch vào giữa một quãng ngẫu nhiên: pháo bắn từ góc thì bay xiên vào trong.
        const burstX = launchX + (centerX - launchX) * (0.25 + Math.random() * 0.4);

        return {
          launchX,
          burstX,
          burstY: height * (0.1 + Math.random() * 0.3),
          delay: volleyIndex * VOLLEY_GAP_MS + Math.random() * WITHIN_VOLLEY_MS,
          // Mỗi quả một màu, như pháo thật — tàn cùng màu với đầu đạn vừa bay lên.
          color: colors[Math.floor(Math.random() * colors.length)],
          particles: Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
            const angle = (i / PARTICLES_PER_BURST) * Math.PI * 2 + Math.random() * 0.25;
            const distance = 54 + Math.random() * 60;
            return {
              dx: Math.cos(angle) * distance,
              dy: Math.sin(angle) * distance,
              size: 4 + Math.random() * 4,
            };
          }),
        };
      });
    });
  }, [width, height, theme.playerColors]);

  if (enabled !== true) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {rockets.map((rocket, index) => (
        <RocketView
          key={index}
          rocket={rocket}
          screenHeight={height}
          onDone={index === rockets.length - 1 ? onDone : undefined}
        />
      ))}
    </View>
  );
}

/** Góc nghiêng của vệt sáng, khớp với đường bay xiên từ bệ tới chỗ nổ. */
function tiltDegrees(rocket: Rocket, screenHeight: number): number {
  const dx = rocket.burstX - rocket.launchX;
  const dy = screenHeight - rocket.burstY;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

function RocketView({
  rocket,
  screenHeight,
  onDone,
}: {
  rocket: Rocket;
  screenHeight: number;
  onDone?: () => void;
}) {
  const launch = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(rocket.delay),
      Animated.timing(launch, {
        toValue: 1,
        duration: LAUNCH_MS,
        // Chậm dần khi lên tới đỉnh, đúng lúc hết đà rồi nổ.
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(burst, {
        toValue: 1,
        duration: BURST_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => animation.stop();
  }, [launch, burst, rocket.delay, onDone]);

  return (
    <>
      {/* Đầu đạn: rời bệ dưới màn hình, bay xiên lên chỗ sắp nổ. */}
      <Animated.View
        style={{
          position: 'absolute',
          left: rocket.launchX,
          top: screenHeight + 12,
          width: 3.5,
          height: 12,
          borderRadius: 2,
          backgroundColor: rocket.color,
          opacity: burst.interpolate({
            inputRange: [0, 0.06],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateX: launch.interpolate({
                inputRange: [0, 1],
                outputRange: [0, rocket.burstX - rocket.launchX],
              }),
            },
            {
              translateY: launch.interpolate({
                inputRange: [0, 1],
                outputRange: [0, rocket.burstY - screenHeight - 12],
              }),
            },
            // Nghiêng theo hướng bay, nếu không thì vệt dựng đứng còn đường đi lại xiên.
            { rotate: `${tiltDegrees(rocket, screenHeight)}deg` },
            // Kéo dài lúc đang lao, co lại khi sắp hết đà — thành vệt sáng.
            { scaleY: launch.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.8, 0.8] }) },
          ],
        }}
      />

      <View style={{ position: 'absolute', left: rocket.burstX, top: rocket.burstY }}>
        {rocket.particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: rocket.color,
              opacity: burst.interpolate({
                inputRange: [0, 0.08, 0.65, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateX: burst.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.dx],
                  }),
                },
                {
                  // Ba mốc thay cho một đường thẳng: tàn vọt ra rồi trĩu xuống.
                  translateY: burst.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0, particle.dy * 0.88, particle.dy + GRAVITY],
                  }),
                },
                {
                  scale: burst.interpolate({
                    inputRange: [0, 0.15, 1],
                    outputRange: [0.3, 1, 0.4],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>
    </>
  );
}
