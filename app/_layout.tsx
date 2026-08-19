import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplash } from '@/components/ui/AppSplash';
import { GamesProvider, useGames } from '@/storage/GamesProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

/**
 * Chữ trên thanh trạng thái phải theo giao diện app đang dùng, không theo cài
 * đặt của máy — người dùng ép giao diện tối trong khi máy đang sáng thì
 * style="auto" sẽ cho chữ đen trên nền tối.
 */
function AppStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

/**
 * Giữ màn chờ cho tới khi hoạt ảnh chạy xong *và* đọc xong dữ liệu từ máy.
 * Nằm trong GamesProvider vì phải biết dữ liệu đã sẵn sàng hay chưa.
 */
function SplashGate({ children }: { children: ReactNode }) {
  const { ready } = useGames();
  const [done, setDone] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {done ? null : <AppSplash ready={ready} onDone={() => setDone(true)} />}
    </View>
  );
}

/**
 * Điều hướng dùng expo-router: mỗi file trong app/ là một màn hình.
 * Header mặc định tắt hết vì mỗi màn tự dựng NavBar riêng theo thiết kế.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GamesProvider>
          <AppStatusBar />
          <SplashGate>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          </SplashGate>
        </GamesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
