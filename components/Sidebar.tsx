import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSidebar } from '@/context/SidebarContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logout, getMyProfileCached } from '@/services/authService';
import { leaveRoom, getActiveRoom } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Text, TouchableOpacity, View, DeviceEventEmitter, ScrollView, NativeModules } from 'react-native';
import { router, usePathname } from 'expo-router';
import api from '@/services/api';

import { DEFAULT_AVATAR } from '@/hooks/use-user-avatar';


const MenuItem = ({ icon, label, onPress, isActive = false, isLogout = false, isDark = true }: { icon: any, label: string, onPress: () => void, isActive?: boolean, isLogout?: boolean, isDark?: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: isActive
        ? (isDark ? '#3c101c' : '#ffe4e6')
        : isLogout
          ? (isDark ? '#3c101c' : '#fff0f0')
          : 'transparent',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: isActive || isLogout
          ? 'transparent'
          : (isDark ? '#2d141d' : '#f3e8ee'),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon} size={18} color={isLogout ? '#ef4444' : isActive ? '#f43f5e' : (isDark ? '#fbcfe8' : '#be123c')} />
      </View>
      <Text style={{
        color: isLogout ? '#ef4444' : isActive ? (isDark ? '#fff' : '#be123c') : (isDark ? '#fbcfe8' : '#3f1f2b'),
        fontSize: 16,
        fontWeight: isActive ? '700' : '500',
      }}>
        {label}
      </Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={16}
      color={isLogout ? '#ef4444' : isActive ? '#f43f5e' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)')}
    />
  </TouchableOpacity>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState('User');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [connectionString, setConnectionString] = useState('');
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR);

  // Load names & avatar from cache on open â€” instant, no API call
  useEffect(() => {
    if (!isOpen) return;
    const loadNamesAndStats = async () => {
      try {
        const cachedName = await AsyncStorage.getItem('cachedUserName');
        if (cachedName) setUserName(cachedName);

        const cachedAvatar = await AsyncStorage.getItem('cachedUserAvatar');
        if (cachedAvatar) setUserAvatar(cachedAvatar);

        const room = await getActiveRoom();
        if (room && room.status === 'ACTIVE' && room.partner_id) {
          const profile = await getMyProfileCached().catch(() => null);
          const myId = profile?.id;
          const resolvedPartner = (myId === room.host_id ? room.partner_name : room.host_name) || null;
          setPartnerName(resolvedPartner);

          const cachedStats = await AsyncStorage.getItem('relationshipStats');
          if (cachedStats && !cachedStats.toLowerCase().includes('unknown')) {
            setConnectionString(`Connected for ${cachedStats}`);
          }

          api.get('/profile/relationship-stats').then(async (response) => {
            const stats = response.data?.data?.stats;
            if (stats?.formattedTime && !stats.formattedTime.toLowerCase().includes('unknown')) {
              setConnectionString(`Connected for ${stats.formattedTime}`);
              await AsyncStorage.setItem('relationshipStats', stats.formattedTime);
            }
          }).catch(() => {});
        } else {
          setPartnerName(null);
          setConnectionString('');
        }
      } catch (err) {
        setPartnerName(null);
        setConnectionString('');
      }
    };
    loadNamesAndStats();

    const sub = DeviceEventEmitter.addListener('profile:updated', (data) => {
      if (data?.avatarUrl) {
        setUserAvatar(data.avatarUrl);
      }
      if (data?.firstName) {
        setUserName(data.firstName);
      }
    });

    const clearSub = DeviceEventEmitter.addListener('app:clearRoom', () => {
      setPartnerName(null);
      setConnectionString('');
    });

    const roomSub = DeviceEventEmitter.addListener('room:updated', () => {
      loadNamesAndStats();
    });

    const closeSub = DeviceEventEmitter.addListener('app:closeSidebar', () => {
      closeSidebar();
    });

    return () => {
      sub.remove();
      clearSub.remove();
      roomSub.remove();
      closeSub.remove();
    };
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
    Alert.alert(
      'Ready to leave?',
      'Are you sure you want to log out of your Love Dare account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Log Out',
          style: 'destructive',
          onPress: async () => {
            console.log('[LOGOUT] Step 1: User confirmed logout');
            setIsLoggingOut(true);
            try {
              try {
                const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
                  if (!isExpoGo) {
                    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
                    GoogleSignin.configure({
                      webClientId: "950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com",
                      iosClientId: "950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com",
                      offlineAccess: false,
                    });
                    try { await GoogleSignin.signInSilently(); } catch (e) {}
                    await GoogleSignin.signOut();
                    console.log("[LOGOUT] Google session cleared.");
                    try { await GoogleSignin.revokeAccess(); } catch (e) {}
                  } else {
                    console.log("[LOGOUT] Skipping Google logout (Expo Go mode).");
                  }
              } catch (googleErr) {
                console.log('[LOGOUT] Google sign out error (ignoring):', googleErr);
              }

              console.log('[LOGOUT] Step 1.5: Unregistering Push Token from backend...');
              try {
                const currentPushToken = await AsyncStorage.getItem('expoPushToken');
                if (currentPushToken) {
                  await api.post('/notifications/unregister-push-token', { pushToken: currentPushToken });
                  console.log('[LOGOUT] Push token unregistered');
                }
              } catch (tokenErr) {
                console.log('[LOGOUT] Push token unregister error (ignoring):', tokenErr);
              }

              console.log('[LOGOUT] Step 2: Clearing ALL AsyncStorage data...');
              await logout();
              const tokenCheck = await AsyncStorage.getItem('accessToken');
              console.log('[LOGOUT] Step 3: Token after clear =', tokenCheck, '(must be null)');

              console.log('[LOGOUT] Step 4: Emitting app:logout...');
                DeviceEventEmitter.emit('app:logout');
                console.log('[LOGOUT] Step 5: Done.');
            } catch (e) {
              console.error('[LOGOUT] ERROR:', e);
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };




  // Full-screen logout loading overlay
  if (isLoggingOut) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 16 }}>Logging out...</Text>
      </View>
    );
  }

  

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Backdrop Overlay */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => !isLoggingOut && closeSidebar()}
        />

        {/* Menu Panel */}
        <View style={{
          width: '82%', height: '100%',
          backgroundColor: isDark ? '#130508' : '#FFFFFF',
          borderTopRightRadius: 40, borderBottomRightRadius: 40,
          paddingTop: 40, zIndex: 1001,
        }}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 16, flex: 1 }}>

            {/* Avatar Section */}
            <View style={{ width: 68, height: 68, marginBottom: 12, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ff2d55' }}>
              <Image
                source={{ uri: userAvatar }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: isDark ? '#ffffff' : '#1a0a0f', letterSpacing: -0.5, marginBottom: 20 }}>
              {userName}
            </Text>
            
            <View style={{ height: 1, backgroundColor: isDark ? '#2a141a' : '#f0dde5', marginBottom: 24 }} />

            {/* Menu Links */}
            <View style={{ flex: 1, paddingTop: 8 }}>
              <MenuItem isDark={isDark} icon="home" label="Home" onPress={() => navigateTo("/")} isActive={pathname === '/' || pathname === ''} />
              <MenuItem isDark={isDark} icon="trophy" label="Challenges" onPress={() => navigateTo("/dares")} isActive={pathname === '/dares'} />
              <MenuItem isDark={isDark} icon="time" label="History" onPress={() => navigateTo("/history")} isActive={pathname === '/history'} />
              <MenuItem isDark={isDark} icon="cart" label="Store" onPress={() => navigateTo("/store")} isActive={pathname === '/store'} />
              <MenuItem isDark={isDark} icon="pricetag" label="Coin Toss" onPress={() => navigateTo("/coin-toss")} isActive={pathname === '/coin-toss'} />
              <MenuItem isDark={isDark} icon="settings" label="Settings" onPress={() => navigateTo("/profile")} isActive={pathname === '/profile'} />
              <MenuItem isDark={isDark} icon="log-out-outline" label="Log Out" onPress={handleLogout} isLogout={true} />
            </View>
          </View>

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 2, color: isDark ? '#555' : '#c0a0b0' }}>SOUL SHUFFLE</Text>
            <Text style={{ fontSize: 9, fontWeight: '600', color: isDark ? '#444' : '#c0a0b0', marginTop: 4 }}>v 1.0.2</Text>
          </View>
        </View>
      </View>

      {/* FULL-SCREEN LOADING SPINNER */}
      {isLoggingOut && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(19,5,8,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#1e1e1e', padding: 32, borderRadius: 16, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 24, fontSize: 18 }}>Signing Out...</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 8 }}>Securing your session</Text>
          </View>
        </View>
      )}
    </View>
  );
}

