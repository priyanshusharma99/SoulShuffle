import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSidebar } from '@/context/SidebarContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logout, getMyProfileCached } from '@/services/authService';
import { signOutGoogle } from '@/services/googleAuth';
import { leaveRoom, getActiveRoom } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Text, TouchableOpacity, View, DeviceEventEmitter, ScrollView, NativeModules } from 'react-native';
import { router, usePathname } from 'expo-router';
import api from '@/services/api';

let lastRelationshipStatsFetchTime = 0;

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

  const [userName, setUserName] = useState('User');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [connectionString, setConnectionString] = useState('');
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

          const now = Date.now();
          if (now - lastRelationshipStatsFetchTime > 15 * 60 * 1000) {
            lastRelationshipStatsFetchTime = now;
            api.get('/profile/relationship-stats').then(async (response) => {
              const stats = response.data?.data?.stats;
              if (stats?.formattedTime && !stats.formattedTime.toLowerCase().includes('unknown')) {
                setConnectionString(`Connected for ${stats.formattedTime}`);
                await AsyncStorage.setItem('relationshipStats', stats.formattedTime);
              }
            }).catch(() => {});
          }
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
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      // ─── STEP 1: Wipe local tokens instantly (~10ms) ──────────────────
      await logout();
      
      // ─── STEP 2: Clear memory token immediately ───────────────────────
      const { setMemoryToken } = require('@/services/api');
      setMemoryToken(null);

      // ─── STEP 3: Close sidebar and navigate instantly — smooth fade, zero glitch ────────
      closeSidebar();
      DeviceEventEmitter.emit('app:logout');

      // ─── STEP 4: Fire-and-forget background cleanup (parallel) ────────
      // User is already on login screen. These run silently in the background.
      Promise.allSettled([
        // Unregister push token from AWS (non-blocking)
        (async () => {
          try {
            const currentPushToken = await AsyncStorage.getItem('expoPushToken');
            if (currentPushToken) {
              await api.post('/notifications/unregister-push-token', { pushToken: currentPushToken });
            }
          } catch {}
        })(),
        // Google sign-out (non-blocking, skip revokeAccess which is slow)
        (async () => {
          try {
            const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
            if (!isExpoGo) {
              const { GoogleSignin } = require('@react-native-google-signin/google-signin');
              GoogleSignin.configure({
                webClientId: '649494442566-4p1lnmhgpuht1eko9kvl26h887dpqdlv.apps.googleusercontent.com',
                iosClientId: '649494442566-020e8g4qi89fbrgip7vvvvns26khppuf.apps.googleusercontent.com',
                offlineAccess: false,
              });
              await GoogleSignin.signOut();
            }
          } catch {}
        })(),
      ]);
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Backdrop Overlay */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={closeSidebar}
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

      {/* CUSTOM DESIGNED LOGOUT POPUP MODAL */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: isDark ? '#1C0D12' : '#FFFFFF',
            borderRadius: 28,
            paddingVertical: 26,
            paddingHorizontal: 22,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.15)',
            shadowColor: '#E11D48',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDark ? 0.45 : 0.15,
            shadowRadius: 24,
            elevation: 12
          }}>
            {/* Glowing Icon Badge */}
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: isDark ? 'rgba(225,29,72,0.18)' : '#FFE4E6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(225,29,72,0.35)' : '#FECDD3'
            }}>
              <Ionicons name="log-out" size={34} color="#E11D48" style={{ marginLeft: 3 }} />
            </View>

            {/* Title & Description */}
            <Text style={{
              fontSize: 22,
              fontWeight: '900',
              color: isDark ? '#FFFFFF' : '#111827',
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: -0.5
            }}>
              Ready to Leave?
            </Text>
            <Text style={{
              fontSize: 14,
              color: isDark ? '#A1A1AA' : '#6B7280',
              textAlign: 'center',
              lineHeight: 21,
              marginBottom: 24,
              fontWeight: '500',
              paddingHorizontal: 4
            }}>
              Are you sure you want to log out of SoulShuffle? Your progress, streaks, and challenges are safely saved.
            </Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#2A141A' : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: '#E11D48',
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

