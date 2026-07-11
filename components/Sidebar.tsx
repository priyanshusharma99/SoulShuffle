import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSidebar } from '@/context/SidebarContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logout } from '@/services/authService';

export default function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLogoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [userName, setUserName] = useState('User');
  const [partnerName, setPartnerName] = useState<string | null>(null);

  // Load names from cache on open — instant, no API call
  useEffect(() => {
    if (!isOpen) return;
    const loadNames = async () => {
      const cachedName = await AsyncStorage.getItem('cachedUserName');
      if (cachedName) setUserName(cachedName);

      const activeRoomId = await AsyncStorage.getItem('activeRoomId');
      if (activeRoomId) {
        const cachedPartner = await AsyncStorage.getItem(`partnerName_${activeRoomId}`);
        if (cachedPartner) setPartnerName(cachedPartner);
      }
    };
    loadNames();
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    closeSidebar();
    router.push(path as any);
  };

  const showComingSoon = (feature: string) => {
    Alert.alert(
      'Coming Soon!',
      `${feature} is currently under construction. Stay tuned for updates!`,
      [{ text: 'Great!' }]
    );
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    // Close UI immediately so there's no visual delay
    setLogoutModalVisible(false);
    closeSidebar();

    // Clear ALL storage — tokens, cached names, room data
    try {
      await logout();
    } catch (e) {}

    // Navigate to login. Use replace so the tabs stack is destroyed and
    // the index.tsx mounts fresh, re-running its token check correctly.
    if (Platform.OS === 'web') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  // Helper to determine if a route is active
  const isRouteActive = (route: string) => {
    if (route === '/' && (pathname === '/' || pathname === '/index')) {
      return true;
    }
    return pathname === route;
  };

  const getLinkStyle = (route: string) => {
    const active = isRouteActive(route);
    if (active) {
      return 'flex-row items-center bg-[#e4525f] py-4 px-6 rounded-full mb-2 shadow-red-200';
    }
    return 'flex-row items-center py-4 px-6 mb-2 rounded-full';
  };

  const getIconColor = (route: string) => {
    const active = isRouteActive(route);
    if (active) return '#fff';
    return isDark ? '#fda4af' : '#857169';
  };

  const getTextColor = (route: string) => {
    const active = isRouteActive(route);
    if (active) return 'text-white';
    return 'text-[#857169] dark:text-slate-300';
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <View className="flex-1 flex-row">
        {/* Backdrop Overlay */}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-black/30 dark:bg-black/50" 
          activeOpacity={1} 
          onPress={closeSidebar} 
        />
        
        {/* Menu Panel */}
        <View className="bg-[#fff8f7] dark:bg-[#180D10] w-[80%] h-full pt-16 rounded-tr-[40px] rounded-br-[40px] shadow-slate-900/40 dark:shadow-black/60 border-r border-[#ffeceb] dark:border-rose-950/20" style={{ zIndex: 1001 }}>
          <View className="px-8 pb-8 flex-1">
            
            {/* Avatar Section */}
            <View className="relative w-20 h-20 mb-4">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' }} 
                className="w-full h-full rounded-full border-[3px] border-[#e24e5d] dark:border-rose-400"
              />
              <View className="absolute -bottom-1 -right-2 bg-[#0d6e67] dark:bg-teal-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-[#180D10]">
                <Text className="text-white font-bold text-[11px]">14</Text>
              </View>
            </View>

            <Text className="text-[28px] font-black text-[#af2c3b] dark:text-slate-100 tracking-tight">
              {partnerName ? `${userName} & ${partnerName}` : userName}
            </Text>
            <Text className="text-[10px] font-bold text-[#e18e8e] dark:text-rose-400/60 tracking-[0.15em] uppercase mt-2">Level 14 Romantic</Text>
            <Text className="text-[14px] font-medium text-slate-600 dark:text-slate-400 mt-1 mb-10">Connected since 2022</Text>

            {/* Menu Links */}
            <TouchableOpacity 
              className={getLinkStyle('/')}
              onPress={() => navigateTo('/')}
            >
              <Ionicons name="home" size={20} color={getIconColor('/')} />
              <Text className={`${getTextColor('/')} font-bold text-[15px] ml-5`}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={getLinkStyle('/dares')}
              onPress={() => navigateTo('/dares')}
            >
              <Ionicons name="trophy" size={20} color={getIconColor('/dares')} />
              <Text className={`${getTextColor('/dares')} font-bold text-[15px] ml-5`}>Challenges</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={getLinkStyle('/history')}
              onPress={() => navigateTo('/history')}
            >
              <Ionicons name="time" size={20} color={getIconColor('/history')} />
              <Text className={`${getTextColor('/history')} font-bold text-[15px] ml-5`}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-6 mb-2 rounded-full"
              onPress={() => showComingSoon('Memory Book')}
            >
              <Ionicons name="book" size={20} color={isDark ? "#fda4af" : "#857169"} />
              <Text className="text-[#857169] dark:text-slate-300 font-bold text-[15px] ml-5">Memory Book</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={getLinkStyle('/coin-toss')}
              onPress={() => navigateTo('/coin-toss')}
            >
              <Ionicons name="pricetag" size={20} color={getIconColor('/coin-toss')} />
              <Text className={`${getTextColor('/coin-toss')} font-bold text-[15px] ml-5`}>Coin Toss</Text>
            </TouchableOpacity>

            {/* Bottom Menu Items */}
            <View className="mt-auto">
              <TouchableOpacity 
                className={getLinkStyle('/profile')}
                onPress={() => navigateTo('/profile')}
              >
                <Ionicons name="settings" size={20} color={getIconColor('/profile')} />
                <Text className={`${getTextColor('/profile')} font-bold text-[15px] ml-5`}>Settings</Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center py-4 px-6 mb-2 rounded-full bg-rose-50 dark:bg-rose-950/30"
              >
                <Ionicons name="log-out-outline" size={20} color="#e11d48" />
                <Text className="text-rose-600 dark:text-rose-400 font-bold text-[15px] ml-5">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="px-8 pb-12 pt-4 border-t border-slate-100 dark:border-slate-800/20 bg-[#fffdfc] dark:bg-[#180D10]/40 rounded-br-[40px]">
            <Text className="text-3xl font-black italic text-[#af2c3b] dark:text-slate-100 tracking-tight mb-2">Love Dare</Text>
            <Text className="text-[8px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">Version 2.4.0 • Made with love</Text>
          </View>
        </View>
      </View>

      {/* Beautiful Custom Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white dark:bg-[#1f0f13] w-full rounded-[32px] p-6 items-center">
            
            {/* Warning Icon Container */}
            <View className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 items-center justify-center mb-5">
              <Ionicons name="log-out-outline" size={32} color="#e11d48" />
            </View>

            {/* Texts */}
            <Text className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center">Ready to leave?</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center mb-8 px-4 font-medium leading-5">
              Are you sure you want to log out of your Love Dare account?
            </Text>

            {/* Buttons */}
            <View className="w-full flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 h-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/50"
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text className="font-bold text-slate-600 dark:text-slate-300">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 h-14 items-center justify-center rounded-2xl bg-rose-500 shadow-rose-500/30"
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text className="font-bold text-white">Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

