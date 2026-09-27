
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { router } from 'expo-router';
import RevenueCatService from '@/services/revenueCatService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0608',
    card: '#271318',
    text: '#e2e8f0',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [rootKey, setRootKey] = useState(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('app:logout', () => {
      console.log('[ROOT LAYOUT] Received app:logout! NUKING STACK.');
      setRootKey(k => k + 1);
      setTimeout(() => {
        router.replace('/login');
      }, 50);
    });
    return () => sub.remove();
  }, []);


  useEffect(() => {
    const initRC = async () => {
      // Try to get cached user ID so purchases map correctly on startup
      const userId = await AsyncStorage.getItem('cachedUserId');
      if (userId) {
        await RevenueCatService.initialize(userId);
      } else {
        // Fallback to anonymous init if not logged in
        await RevenueCatService.initialize('anonymous_user');
      }
    };
    initRC();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : DefaultTheme}>
        <SidebarProvider>
          <NotificationProvider>
            <Stack key={rootKey}>
              <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false, animation: "fade" }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="questionnaire" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="coin-toss" options={{ headerShown: false, presentation: 'card' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </NotificationProvider>
        </SidebarProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

