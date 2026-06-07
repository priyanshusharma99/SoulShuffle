import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
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
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const SCREEN_W = Dimensions.get('window').width;

const TABS = [
  { name: 'index',   label: 'Home',    icon: 'heart-outline',      activeIcon: 'heart'       },
  { name: 'dares',   label: 'Dares',   icon: 'copy-outline',       activeIcon: 'copy'        },
  { name: 'history', label: 'History', icon: 'hourglass-outline',  activeIcon: 'hourglass'   },
  { name: 'chat',    label: 'Chat',    icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { name: 'profile', label: 'Profile', icon: 'rose-outline',       activeIcon: 'rose'        },
];

// ─── Single Animated Tab Item ─────────────────────────────────────────────────
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
  // Pill background scale
  const pillScale = useSharedValue(focused ? 1 : 0);
  // Icon bounce on press
  const pressScale = useSharedValue(1);
  // Icon float when focused
  const translateY = useSharedValue(focused ? -2 : 2);
  // Label opacity
  const labelOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    pillScale.value = withSpring(focused ? 1 : 0, {
      damping: 18,
      stiffness: 220,
      mass: 0.6,
    });
    translateY.value = withSpring(focused ? -2 : 2, {
      damping: 16,
      stiffness: 200,
    });
    labelOpacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

  const handlePress = () => {
    pressScale.value = withSpring(0.8, { damping: 6, stiffness: 400 }, () => {
      pressScale.value = withSpring(1, { damping: 10, stiffness: 280 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillScale.value,
    transform: [{ scale: pillScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pressScale.value },
      { translateY: translateY.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const activeColor = '#f43f5e';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.38)' : '#94a3b8';

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={handlePress}
      activeOpacity={1}
    >
      {/* Pill background */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: isDark ? '#7f1d32' : '#ffe4e6' },
          pillStyle,
        ]}
      />

      {/* Icon */}
      <Animated.View style={iconStyle}>
        <Ionicons
          name={(focused ? tab.activeIcon : tab.icon) as any}
          size={22}
          color={focused ? activeColor : inactiveColor}
        />
      </Animated.View>

      {/* Label — only visible when focused */}
      <Animated.Text
        style={[styles.label, { color: activeColor }, labelStyle]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark ? '#130810' : '#ffffff',
          shadowColor: isDark ? '#000' : '#be123c',
        },
      ]}
    >
      {TABS.map((tab, index) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const focused = state.index === index;

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
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const TAB_H = Platform.OS === 'ios' ? 82 : 68;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: TAB_H,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    width: 52,
    height: 38,
    borderRadius: 19,
    top: 0,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
    marginTop: 1,
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
