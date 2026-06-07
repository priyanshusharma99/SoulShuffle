import { Tabs } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Sidebar from '@/components/Sidebar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { name: 'index',   label: 'Home',    icon: 'heart-outline',       activeIcon: 'heart'        },
  { name: 'dares',   label: 'Dares',   icon: 'copy-outline',        activeIcon: 'copy'         },
  { name: 'history', label: 'History', icon: 'hourglass-outline',   activeIcon: 'hourglass'    },
  { name: 'chat',    label: 'Chat',    icon: 'chatbubbles-outline',  activeIcon: 'chatbubbles'  },
  { name: 'profile', label: 'Profile', icon: 'rose-outline',        activeIcon: 'rose'         },
];

const TAB_COUNT = TABS.length;
const TAB_BAR_H = 70;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 16 : 8;
const PILL_W = 56;
const PILL_H = 40;
const TAB_W = SCREEN_WIDTH / TAB_COUNT;

// ─── Single Tab Button ────────────────────────────────────────────────────────
function TabButton({
  tab,
  index,
  activeIndex,
  isDark,
  onPress,
}: {
  tab: (typeof TABS)[0];
  index: number;
  activeIndex: Animated.SharedValue<number>;
  isDark: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.78, { damping: 8, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 260 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconStyle = useAnimatedStyle(() => {
    const focused = interpolate(
      activeIndex.value,
      [index - 0.4, index, index + 0.4],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scale: scale.value * interpolate(focused, [0, 1], [0.88, 1.08], Extrapolation.CLAMP) },
        { translateY: interpolate(focused, [0, 1], [0, -2], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(focused, [0, 1], [0.45, 1], Extrapolation.CLAMP),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const focused = interpolate(
      activeIndex.value,
      [index - 0.4, index, index + 0.4],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(focused, [0, 1], [0.4, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(focused, [0, 1], [4, 0], Extrapolation.CLAMP) },
      ],
    };
  });


  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={1}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        {/* icon rendered via animated color workaround */}
        <AnimatedIcon
          activeIndex={activeIndex}
          index={index}
          tab={tab}
          isDark={isDark}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af' },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ─── Animated Icon (handles color separately) ─────────────────────────────────
function AnimatedIcon({
  activeIndex,
  index,
  tab,
  isDark,
}: {
  activeIndex: Animated.SharedValue<number>;
  index: number;
  tab: (typeof TABS)[0];
  isDark: boolean;
}) {
  // We can't pass animated color directly to Ionicons, so we render two icons
  // and cross-fade them — active (white) fades in, inactive fades out.
  const activeOpacity = useAnimatedStyle(() => {
    const focused = interpolate(
      activeIndex.value,
      [index - 0.4, index, index + 0.4],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity: focused };
  });

  const inactiveOpacity = useAnimatedStyle(() => {
    const focused = interpolate(
      activeIndex.value,
      [index - 0.4, index, index + 0.4],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity: 1 - focused };
  });

  return (
    <View style={{ width: 24, height: 24 }}>
      {/* inactive icon */}
      <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, inactiveOpacity]}>
        <Ionicons size={22} name={tab.icon as any} color={isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af'} />
      </Animated.View>
      {/* active icon */}
      <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, activeOpacity]}>
        <Ionicons size={22} name={tab.activeIcon as any} color="#fff" />
      </Animated.View>
    </View>
  );
}

// ─── Sliding Pill ─────────────────────────────────────────────────────────────
function SlidingPill({
  activeIndex,
  isDark,
}: {
  activeIndex: Animated.SharedValue<number>;
  isDark: boolean;
}) {
  const pillStyle = useAnimatedStyle(() => {
    // Simple linear arithmetic — no .map() inside worklets!
    const x = activeIndex.value * TAB_W + (TAB_W - PILL_W) / 2;
    return {
      transform: [{ translateX: x }],
    };
  });


  return (
    <Animated.View
      style={[
        styles.pill,
        {
          backgroundColor: isDark ? '#c2324a' : '#e11d48',
          shadowColor: isDark ? '#f43f5e' : '#e11d48',
        },
        pillStyle,
      ]}
    />
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const isDark = useColorScheme() === 'dark';

  // Shared value drives ALL animations — single source of truth
  const activeIndex = useSharedValue(state.index);

  // Keep in sync with route changes (back button, deep links, etc.)
  React.useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 22,
      stiffness: 200,
      mass: 0.7,
    });
  }, [state.index]);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark ? '#160A0D' : '#ffffff',
          shadowColor: isDark ? '#000' : '#be123c',
        },
      ]}
    >
      {/* Sliding pill (sits behind icons) */}
      <SlidingPill activeIndex={activeIndex} isDark={isDark} />

      {/* Tab buttons */}
      {TABS.map((tab, index) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;

        return (
          <TabButton
            key={tab.name}
            tab={tab}
            index={index}
            activeIndex={activeIndex}
            isDark={isDark}
            onPress={() => {
              activeIndex.value = withSpring(index, {
                damping: 22,
                stiffness: 200,
                mass: 0.7,
              });
              const isFocused = state.index === index;
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_H + TAB_BAR_PADDING_BOTTOM,
    paddingBottom: TAB_BAR_PADDING_BOTTOM,
    alignItems: 'center',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: (TAB_BAR_H - PILL_H) / 2 - TAB_BAR_PADDING_BOTTOM / 2,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    width: TAB_W,
    height: TAB_BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'capitalize',
  },
});

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
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
      </Tabs>
      <Sidebar />
    </View>
  );
}
