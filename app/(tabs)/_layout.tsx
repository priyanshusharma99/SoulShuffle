import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TabIcon = ({ name, title, focused, color, activeIcon }: any) => {
  if (focused) {
    return (
      <View className="bg-[#e24e5d] w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-red-300">
        <Ionicons size={18} name={activeIcon || name} color="#fff" />
        <Text className="text-white text-[8px] font-bold tracking-widest mt-1 uppercase">{title}</Text>
      </View>
    );
  }
  return (
    <View className="items-center justify-center">
      <Ionicons size={24} name={name} color={color} />
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 80,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.5,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home-outline" activeIcon="home" title="HOME" focused={focused} color={color} />,
          tabBarLabel: ({ focused, color }) => focused ? null : <Text style={{ fontSize: 10, fontWeight: '700', color, marginTop: 4, letterSpacing: 0.5 }}>HOME</Text>
        }}
      />
      <Tabs.Screen
        name="dares"
        options={{
          title: 'DARES',
          tabBarIcon: ({ color, focused }) => <TabIcon name="book-outline" activeIcon="book" title="DARES" focused={focused} color={color} />,
          tabBarLabel: ({ focused, color }) => focused ? null : <Text style={{ fontSize: 10, fontWeight: '700', color, marginTop: 4, letterSpacing: 0.5 }}>DARES</Text>
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, focused }) => <TabIcon name="time-outline" activeIcon="time" title="HISTORY" focused={focused} color={color} />,
          tabBarLabel: ({ focused, color }) => focused ? null : <Text style={{ fontSize: 10, fontWeight: '700', color, marginTop: 4, letterSpacing: 0.5 }}>HISTORY</Text>
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'CHAT',
          tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubble-outline" activeIcon="chatbubble" title="CHAT" focused={focused} color={color} />,
          tabBarLabel: ({ focused, color }) => focused ? null : <Text style={{ fontSize: 10, fontWeight: '700', color, marginTop: 4, letterSpacing: 0.5 }}>CHAT</Text>
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person-outline" activeIcon="person" title="PROFILE" focused={focused} color={color} />,
          tabBarLabel: ({ focused, color }) => focused ? null : <Text style={{ fontSize: 10, fontWeight: '700', color, marginTop: 4, letterSpacing: 0.5 }}>PROFILE</Text>
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: 'Explore',
        }}
      />
    </Tabs>
  );
}
