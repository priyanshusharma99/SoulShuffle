import { Tabs, useRouter, useSegments, usePathname } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameSocket from '@/services/socketService';
import { getActiveRoom } from '@/services/roomService';
import { getMyProfileCached } from '@/services/authService';
import { setPendingCoinToss, saveCoinTossItem } from '@/services/coinTossService';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Sidebar from '@/components/Sidebar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type BottomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
  insets?: any;
};

const TABS = [
  { name: 'index',     label: 'Home',    icon: 'home-outline',            activeIcon: 'home'            },
  { name: 'dares',     label: 'Dares',   icon: 'compass-outline',         activeIcon: 'compass'         },
  { name: 'coin-toss', label: 'Games',   icon: 'game-controller-outline', activeIcon: 'game-controller' },
  { name: 'history',   label: 'Journey', icon: 'time-outline',            activeIcon: 'time'            },
  { name: 'store',     label: 'Store',   icon: 'bag-outline',             activeIcon: 'bag'             },
];

// ─── Tab Button Item ──────────────────────────────────────────────────────────
function TabItem({
  tab,
  focused,
  isDark,
  onPress,
}: {
  tab: (typeof TABS)[0];
  focused: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const width = useSharedValue(focused ? 110 : 46);
  const textOpacity = useSharedValue(focused ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    width.value = withSpring(focused ? 110 : 46, { damping: 18, stiffness: 150, mass: 0.8 });
    textOpacity.value = withTiming(focused ? 1 : 0, { duration: 150 });
  }, [focused]);

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 240 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateX: withSpring(focused ? 0 : -6) }],
  }));

  const activeBg = isDark ? '#e11d48' : '#ffe4e6';
  const activeColor = isDark ? '#ffffff' : '#f43f5e';
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.7)';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
      <Animated.View
        style={[
          styles.tabItem,
          { backgroundColor: focused ? activeBg : 'transparent' },
          containerStyle,
        ]}
      >
        <Ionicons
          size={18}
          name={(focused ? tab.activeIcon : tab.icon) as any}
          color={focused ? activeColor : inactiveColor}
        />
        {focused && (
          <Animated.Text
            style={[styles.labelText, { color: activeColor }, textStyle]}
            numberOfLines={1}
          >
            {tab.label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ✨ Custom Floating Tab Bar ✨
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const bottomMargin = Platform.OS === 'ios'
    ? Math.max(24, insets.bottom)
    : Math.max(16, insets.bottom + 8);

  return (
    <View style={[styles.barContainer, { bottom: bottomMargin }]} pointerEvents="box-none">
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? '#261216' : '#FFFFFF',
            borderColor: isDark ? '#4A232A' : '#F1E8EC',
            shadowColor: '#000',
          },
        ]}
      >
        {TABS.map((tab) => {
          const route = state.routes.find((r: any) => r.name === tab.name);
          if (!route) return null;
          const focused = state.index === state.routes.findIndex((r: any) => r.name === tab.name);

          return (
            <TabItem
              key={tab.name}
              tab={tab}
              focused={focused}
              isDark={isDark}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignSelf: 'center',
    zIndex: 100, // Ensure it floats on top of everything!
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    height: 42,
  },
  labelText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});


// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  const pathnameRef = useRef(pathname);
  const segmentsRef = useRef(segments);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  // ── Global socket connection across all tabs ──
  useEffect(() => {
    let isMounted = true;
    const initGlobalSocket = async () => {
      try {
        const activeRoom = await getActiveRoom();
        if (isMounted && activeRoom?.code) {
          await GameSocket.initialize();
          await GameSocket.joinRoom(activeRoom.code);
        }
      } catch (err) {
        console.log('[TabLayout] Global socket sync error:', err);
      }
    };

    initGlobalSocket();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Global Coin Toss Real-time Interceptor & Partner Redirection ──
  useEffect(() => {
    let lastHandledEventId = '';
    let lastHandledTime = 0;

    const handleGameEvent = async (payload: any) => {
      const eventType = payload?.eventType;
      const eventData = payload?.data || payload;
      if (!eventData) return;

      if (eventType === 'COIN_TOSS' || eventType === 'COIN_FLIP_RESULT') {
        const eventId = String(eventData.eventId || eventData.timestamp || Date.now());
        if (eventId === lastHandledEventId || (Date.now() - lastHandledTime < 1500)) {
          return;
        }
        lastHandledEventId = eventId;
        lastHandledTime = Date.now();

        // Check if the current user was the flipper
        const myProfile = await getMyProfileCached().catch(() => null);
        const myId = myProfile?.id;
        const flipperId = eventData.flipperId || eventData.flipper_id;
        if (myId && flipperId && myId === flipperId) {
          // This client flipped locally, no redirection needed
          return;
        }

        const incomingResult = (eventData.result || eventData.chosen_side || 'HEADS').toUpperCase();
        const partnerChoice = (eventData.flipperChoice || eventData.choice || eventData.chosen_side || 'HEADS').toUpperCase();

        const pendingData = {
          eventId,
          flipperChoice: partnerChoice,
          choice: partnerChoice,
          result: incomingResult,
          flipperId: flipperId,
          flipperName: eventData.flipperName || 'Partner',
          winnerId: eventData.winnerId || eventData.winner_id,
          reason: eventData.reason || 'Coin Toss Decider',
          timestamp: Date.now(),
        };

        // Store into coin toss coordinator
        setPendingCoinToss(pendingData);

        // Pre-save into local storage in background
        const myOppositeChoice = partnerChoice === 'HEADS' ? 'TAILS' : 'HEADS';
        const isMeWinner = myOppositeChoice === incomingResult;
        const flipperName = eventData.flipperName || 'Partner';
        const reason = eventData.reason || 'Coin Toss Decider';

        saveCoinTossItem({
          id: eventId,
          flipperName,
          choice: partnerChoice,
          result: incomingResult,
          outcome: isMeWinner ? 'YOU WON' : `${flipperName.toUpperCase()} WON`,
          reason,
          isMeWinner,
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        }).catch(() => {});

        // Close sidebar if open
        DeviceEventEmitter.emit('app:closeSidebar');

        // Broadcast to CoinToss screen
        DeviceEventEmitter.emit('coin:remote_toss', pendingData);

        // Check if user is already on coin-toss
        const currentPath = pathnameRef.current || '';
        const currentSegments = (segmentsRef.current as string[]) || [];
        const isAlreadyOnCoinToss =
          currentPath.includes('/coin-toss') ||
          currentSegments.includes('coin-toss');

        if (!isAlreadyOnCoinToss) {
          console.log('[TabLayout] Partner tossed coin! Redirecting partner to /(tabs)/coin-toss from', currentPath);
          router.push('/(tabs)/coin-toss');
        }
      }
    };

    GameSocket.on('game_event', handleGameEvent);
    GameSocket.on('coin_flip_result', (data: any) => handleGameEvent({ eventType: 'COIN_FLIP_RESULT', data }));

    return () => {
      GameSocket.off('game_event', handleGameEvent);
      GameSocket.off('coin_flip_result', handleGameEvent);
    };
  }, [router]);

  // ── Logout handler: resets root Stack to login screen ──
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('app:logout', () => {
      console.log('[TABS LAYOUT] app:logout resetting root stack to index');
        setTimeout(() => {
           while (router.canGoBack()) { router.back(); }
           router.replace('/');
        }, 100);
      });
    return () => sub.remove();
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
        ))}
        <Tabs.Screen name="explore" options={{ href: null, title: 'Explore' }} />
        <Tabs.Screen name="chat" options={{ href: null, title: 'Chat' }} />
        <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
      </Tabs>
      <Sidebar />
    </View>
  );
}


