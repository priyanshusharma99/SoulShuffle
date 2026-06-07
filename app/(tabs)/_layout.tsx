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
  { name: 'index',   label: 'Home',    icon: 'heart-outline',      activeIcon: 'heart'       },
  { name: 'dares',   label: 'Dares',   icon: 'copy-outline',       activeIcon: 'copy'        },
  { name: 'history', label: 'History', icon: 'hourglass-outline',  activeIcon: 'hourglass'   },
  { name: 'chat',    label: 'Chat',    icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { name: 'profile', label: 'Profile', icon: 'rose-outline',       activeIcon: 'rose'        },
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
    width.value = withSpring(focused ? 110 : 46, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
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
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748b';

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

// ─── Custom Floating Tab Bar ──────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark ? '#251216' : '#ffffff', // Stands out against #0F0608 (dark) or bg-rose-50 (light)
          borderTopColor: isDark ? '#3d1e24' : '#f1f5f9',
          shadowColor: isDark ? '#000' : '#e11d48',
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
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
    elevation: 16,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderTopWidth: 1,
  },
  tabItem: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
    overflow: 'hidden',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
