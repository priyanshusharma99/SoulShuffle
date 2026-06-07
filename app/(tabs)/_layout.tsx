import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

const TABS = [
  { name: 'index',   label: 'HOME',    icon: 'heart-outline',      activeIcon: 'heart'       },
  { name: 'dares',   label: 'DARES',   icon: 'copy-outline',       activeIcon: 'copy'        },
  { name: 'history', label: 'HISTORY', icon: 'hourglass-outline',  activeIcon: 'hourglass'   },
  { name: 'chat',    label: 'CHAT',    icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { name: 'profile', label: 'PROFILE', icon: 'rose-outline',       activeIcon: 'rose'        },
];

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 220,
  mass: 0.5,
};

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
  // Animated values
  const activeScale = useSharedValue(focused ? 1 : 0);
  const activeOpacity = useSharedValue(focused ? 1 : 0);
  const inactiveScale = useSharedValue(focused ? 0.7 : 1);
  const inactiveOpacity = useSharedValue(focused ? 0 : 1);

  useEffect(() => {
    if (focused) {
      activeScale.value = withSpring(1, SPRING_CONFIG);
      activeOpacity.value = withTiming(1, { duration: 150 });
      inactiveScale.value = withSpring(0.7, SPRING_CONFIG);
      inactiveOpacity.value = withTiming(0, { duration: 100 });
    } else {
      activeScale.value = withSpring(0, SPRING_CONFIG);
      activeOpacity.value = withTiming(0, { duration: 100 });
      inactiveScale.value = withSpring(1, SPRING_CONFIG);
      inactiveOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [focused]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const activeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: activeScale.value }],
    opacity: activeOpacity.value,
  }));

  const inactiveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inactiveScale.value }],
    opacity: inactiveOpacity.value,
  }));

  const activeBg = isDark ? '#e11d48' : '#e24e5d';
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af';

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={handlePress}
      activeOpacity={1}
    >
      {/* Active State (Circular Pill with Icon & Text) */}
      <Animated.View
        style={[
          styles.activeBadge,
          {
            backgroundColor: activeBg,
            shadowColor: activeBg,
          },
          activeStyle,
        ]}
      >
        <Ionicons size={18} name={tab.activeIcon as any} color="#fff" />
        <Text style={styles.labelText} numberOfLines={1}>
          {tab.label}
        </Text>
      </Animated.View>

      {/* Inactive State (Just the icon) */}
      <Animated.View style={[styles.inactiveIconWrap, inactiveStyle]}>
        <Ionicons size={24} name={tab.icon as any} color={inactiveColor} />
      </Animated.View>
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
          backgroundColor: isDark ? '#160A0D' : '#ffffff',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
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
const TAB_BAR_H = Platform.OS === 'ios' ? 88 : 72;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_H,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  activeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inactiveIconWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: 'uppercase',
    color: '#ffffff',
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
