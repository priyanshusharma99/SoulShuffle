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
const TabItem = React.memo(
  function TabItem({
    tab,
    routeKey,
    focused,
    isDark,
    onPressTab,
  }: {
    tab: (typeof TABS)[0];
    routeKey: string;
    focused: boolean;
    isDark: boolean;
    onPressTab: (name: string, routeKey: string, focused: boolean) => void;
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPressTab(tab.name, routeKey, focused);
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
  },
  (prev, next) =>
    prev.focused === next.focused &&
    prev.isDark === next.isDark &&
    prev.tab.name === next.tab.name &&
    prev.routeKey === next.routeKey
);

// ✨ Custom Floating Tab Bar ✨
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback((name: string, routeKey: string, focused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) {
      navigation.navigate(name);
    }
  }, [navigation]);

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
              routeKey={route.key}
              focused={focused}
              isDark={isDark}
              onPressTab={handleTabPress}
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

    const handleCardEvent = () => {
      DeviceEventEmitter.emit('app:refreshHistory');
      DeviceEventEmitter.emit('app:refreshDashboard');
    };

    GameSocket.on('game_event', handleGameEvent);
    GameSocket.on('coin_flip_result', (data: any) => handleGameEvent({ eventType: 'COIN_FLIP_RESULT', data }));
    GameSocket.on('card_received', handleCardEvent);
    GameSocket.on('card_accepted', handleCardEvent);
    GameSocket.on('card_deflected', handleCardEvent);
    GameSocket.on('card_completed_by_receiver', handleCardEvent);
    GameSocket.on('card_confirmed', handleCardEvent);
    GameSocket.on('card_rejected', handleCardEvent);

    return () => {
      GameSocket.off('game_event', handleGameEvent);
      GameSocket.off('coin_flip_result', handleGameEvent);
      GameSocket.off('card_received', handleCardEvent);
      GameSocket.off('card_accepted', handleCardEvent);
      GameSocket.off('card_deflected', handleCardEvent);
      GameSocket.off('card_completed_by_receiver', handleCardEvent);
      GameSocket.off('card_confirmed', handleCardEvent);
      GameSocket.off('card_rejected', handleCardEvent);
    };
  }, [router]);


  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          lazy: true,
        }}
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


