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

  const activeBg = isDark ? '#2D1418' : '#ffe4e6';
  const activeColor = '#f43f5e';
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
    <View style={styles.barContainer}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? '#110709' : '#1e293b', // Dark container on both light/dark
            shadowColor: '#000',
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    maxWidth: 380,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  tabItem: {
    height: 46,
    borderRadius: 23,
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
