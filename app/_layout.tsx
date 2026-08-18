import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GamesProvider } from '@/storage/GamesProvider';
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
 * Điều hướng dùng expo-router: mỗi file trong app/ là một màn hình.
 * Header mặc định tắt hết vì mỗi màn tự dựng NavBar riêng theo thiết kế.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GamesProvider>
          <AppStatusBar />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </GamesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
