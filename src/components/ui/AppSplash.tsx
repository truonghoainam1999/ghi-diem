import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View, useWindowDimensions, type ViewStyle } from 'react-native';

/** Nền và màu ký hiệu lấy đúng từ icon app, không theo giao diện sáng/tối. */
const GROUND = '#12161C';
const MARK = '#F0F2F5';

/** Khung vuông chứa ký hiệu, và đơn vị quy đổi từ hệ toạ độ 100×100 của logo. */
const BOX = 200;
const U = BOX / 100;
const STROKE = 10 * U;

const FADE_MS = 280;

/**
 * Một nét của logo, đặt bằng toạ độ hai đầu trong hệ 100×100 — giống hệt cách
 * viết trong file SVG gốc, nên sửa logo chỉ việc chép lại các con số.
 * Nét chéo cũng dùng chung hàm này: xoay quanh tâm thay vì tính tay.
 */
function strokeStyle(x1: number, y1: number, x2: number, y2: number): ViewStyle {
  const dx = (x2 - x1) * U;
  const dy = (y2 - y1) * U;
  // Cộng thêm STROKE vì hai đầu bo tròn ăn ra ngoài mỗi bên nửa nét.
  const length = Math.hypot(dx, dy) + STROKE;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    position: 'absolute',
    left: ((x1 + x2) / 2) * U - length / 2,
    top: ((y1 + y2) / 2) * U - STROKE / 2,
    width: length,
    height: STROKE,
    borderRadius: STROKE / 2,
    backgroundColor: MARK,
    transform: [{ rotate: `${angle}deg` }],
  };
}

const FILL: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

/** Nét ngang lao vào từ phải. Lò xo mềm và nặng nên nẩy chậm, không giật. */
const BAR_SPRING = { damping: 9, stiffness: 70, mass: 1.4, useNativeDriver: true } as const;

const ORBIT_MS = 2200;

/** Lắc nốt vài nhịp sau khi vào chỗ. Damping thấp nên vượt qua rồi mới đứng. */
const WOBBLE_SPRING = { damping: 6, stiffness: 110, mass: 1, useNativeDriver: true } as const;

/**
 * Một ký hiệu bay một vòng quanh tâm rồi vào chỗ.
 *
 * Tâm khung vuông trùng đúng tâm nét ngang, nên xoay lớp ngoài là ký hiệu chạy
 * vòng quanh dấu trừ; lớp trong kéo nó từ xa thu dần về đúng chỗ. Góc quay và
 * bán kính phải tách làm hai lớp — gộp một giá trị lò xo thì lúc vọt quá đích,
 * bán kính âm sẽ ném ký hiệu sang hẳn bên kia tâm.
 *
 * Mờ dần hiện ra trong 12% quãng đầu. Chỉ đẩy ra xa là không đủ để giấu lúc chờ
 * tới lượt: bán kính đủ lớn để ra hẳn ngoài màn hình thì vòng lượn cũng to theo,
 * và ký hiệu biến mất gần hết vòng.
 *
 * @param sway  biên độ lắc cuối, độ — đảo dấu giữa hai ký hiệu cho đỡ đều nhịp
 */
function orbitStyles(
  progress: Animated.Value,
  wobble: Animated.Value,
  { radius, sway }: { radius: number; sway: number },
) {
  return {
    outer: {
      opacity: progress.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 1] }),
      transform: [
        { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-360deg', '0deg'] }) },
        { rotate: wobble.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${sway}deg`] }) },
      ],
    },
    inner: {
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-radius, 0] }) }],
    },
  };
}

/**
 * Màn chờ có hoạt ảnh: nét ngang lao vào từ phải, dấu cộng rồi dấu nhân rơi từ
 * trên xuống, lượn một vòng quanh nét ngang rồi lắc nhẹ vào đúng chỗ.
 *
 * Chỉ chạy được sau khi mã JS đã tải xong — quãng trước đó là màn chờ gốc của
 * hệ điều hành, và nó chỉ hiện được ảnh tĩnh. Nên màn chờ gốc để trống, chỉ còn
 * nền tối: đó đúng là khung hình đầu của hoạt ảnh này, nối vào không thấy vết.
 */
export function AppSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const { width, height } = useWindowDimensions();

  const bar = useRef(new Animated.Value(0)).current;
  const plus = useRef(new Animated.Value(0)).current;
  const cross = useRef(new Animated.Value(0)).current;
  // Bắt đầu ở 1 rồi lò xo kéo về 0, nên nhịp lắc nối thẳng vào lúc vừa hạ cánh.
  const plusSway = useRef(new Animated.Value(1)).current;
  const crossSway = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /** Bay vòng vào chỗ, rồi lắc nốt cho hết đà. */
    const flyIn = (progress: Animated.Value, wobble: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: ORBIT_MS,
          // Vào nhẹ, ra nhẹ: một vòng chậm thì tốc độ đều quá sẽ thành máy móc.
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(wobble, { toValue: 0, ...WOBBLE_SPRING }),
      ]);

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;

      // Giảm chuyển động: đặt thẳng vào vị trí cuối, không bay không nẩy.
      if (reduced) {
        for (const value of [bar, plus, cross]) value.setValue(1);
        for (const value of [plusSway, crossSway]) value.setValue(0);
        setSettled(true);
        return;
      }

      Animated.parallel([
        Animated.spring(bar, { toValue: 1, ...BAR_SPRING }),
        flyIn(plus, plusSway, 400),
        flyIn(cross, crossSway, 700),
      ]).start(({ finished }) => {
        if (finished && !cancelled) setSettled(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [bar, plus, cross, plusSway, crossSway]);

  // Chỉ tan đi khi vừa chạy xong hoạt ảnh vừa nạp xong dữ liệu — hết trước thì
  // đứng chờ, chứ không nháy sang màn hình trống rồi mới có nội dung.
  useEffect(() => {
    if (!settled || !ready) return;
    Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(onDone);
  }, [settled, ready, opacity, onDone]);

  const barSlide = {
    transform: [{ translateX: bar.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }],
  };

  // Xuất phát cao hơn nửa màn hình một chút: đủ để thấy rõ là rơi từ trên xuống,
  // mà vòng lượn vẫn nằm gọn trong khung nhìn.
  const plusOrbit = orbitStyles(plus, plusSway, { radius: height * 0.3, sway: 12 });
  const crossOrbit = orbitStyles(cross, crossSway, { radius: height * 0.36, sway: -12 });

  return (
    <Animated.View style={[FILL, { backgroundColor: GROUND, opacity, alignItems: 'center', justifyContent: 'center' }]}>
      <View style={{ width: BOX, height: BOX }}>
        <Animated.View style={[FILL, barSlide]}>
          <View style={strokeStyle(14, 50, 86, 50)} />
        </Animated.View>

        <Animated.View style={[FILL, plusOrbit.outer]}>
          <Animated.View style={[FILL, plusOrbit.inner]}>
            <View style={strokeStyle(42, 24, 58, 24)} />
            <View style={strokeStyle(50, 16, 50, 32)} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[FILL, crossOrbit.outer]}>
          <Animated.View style={[FILL, crossOrbit.inner]}>
            <View style={strokeStyle(43, 69, 57, 83)} />
            <View style={strokeStyle(57, 69, 43, 83)} />
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
