import { useSidebar } from '@/context/SidebarContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logout, getMyProfileCached } from '@/services/authService';
import { leaveRoom, getActiveRoom } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Text, TouchableOpacity, View, DeviceEventEmitter, ScrollView, NativeModules } from 'react-native';
import { router, usePathname } from 'expo-router';
import api from '@/services/api';

import { DEFAULT_AVATAR } from '@/hooks/use-user-avatar';

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

  // Load names & avatar from cache on open — instant, no API call
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
            closeSidebar();
            try {
              try {
                if (NativeModules.RNGoogleSignin) {
                  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                  GoogleSignin.configure({
                    webClientId: '950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com',
                    iosClientId: '950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com',
                    offlineAccess: false,
                  });
                  try {
                    await GoogleSignin.signInSilently();
                  } catch (e) {}
                  
                  await GoogleSignin.signOut();
                  console.log('[LOGOUT] Google session cleared.');
                  
                  try {
                    await GoogleSignin.revokeAccess();
                  } catch (e) {}
                } else {
                  console.log('[LOGOUT] RNGoogleSignin not found. Skipping Google logout (Expo Go mode).');
                }
              } catch (googleErr) {
                console.log('[LOGOUT] Google sign out error (ignoring):', googleErr);
              }

              console.log('[LOGOUT] Step 2: Clearing ALL AsyncStorage data...');
              await AsyncStorage.clear();
              const tokenCheck = await AsyncStorage.getItem('accessToken');
              console.log('[LOGOUT] Step 3: Token after clear =', tokenCheck, '(must be null)');

              console.log('[LOGOUT] Step 4: Emitting app:logout for root layout to navigate...');
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

  const MenuItem = ({ icon, label, path, isActive = false, isLogout = false }: { icon: any, label: string, path?: string, isActive?: boolean, isLogout?: boolean }) => (
    <TouchableOpacity
      onPress={() => isLogout ? handleLogout() : navigateTo(path!)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        backgroundColor: isActive || isLogout ? '#3c101c' : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: isActive || isLogout ? 'transparent' : '#2d141d',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name={icon} size={16} color={isLogout ? "#e55f75" : isActive ? "white" : "#ffb3c6"} />
        </View>
        <Text style={{
          color: isLogout ? "#e55f75" : "white",
          fontWeight: '700',
          fontSize: 14,
          marginLeft: 14,
        }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={isLogout ? "#e55f75" : "white"} />
    </TouchableOpacity>
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Backdrop Overlay */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => !isLoggingOut && closeSidebar()}
        />

        {/* Menu Panel */}
        <View style={{ width: '82%', height: '100%', backgroundColor: '#130508', borderTopRightRadius: 40, borderBottomRightRadius: 40, paddingTop: 40, zIndex: 1001 }}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 16, flex: 1 }}>

            {/* Avatar Section */}
            <View style={{ width: 68, height: 68, marginBottom: 12, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ff2d55' }}>
              <Image
                source={{ uri: userAvatar }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              {partnerName ? `${userName} & ${partnerName}` : userName}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#888', marginTop: 4, marginBottom: 16 }}>
              Same team, Always ♡
            </Text>
            
            <View style={{ height: 1, backgroundColor: '#2a141a', marginBottom: 16 }} />

            {/* Menu Links */}
            <View style={{ flex: 1 }}>
              <MenuItem icon="home" label="Home" path="/" isActive={pathname === '/' || pathname === ''} />
              <MenuItem icon="trophy" label="Challenges" path="/dares" isActive={pathname === '/dares'} />
              <MenuItem icon="time" label="History" path="/history" isActive={pathname === '/history'} />
              <MenuItem icon="cart" label="Store" path="/store" isActive={pathname === '/store'} />
              <MenuItem icon="pricetag" label="Coin Toss" path="/coin-toss" isActive={pathname === '/coin-toss'} />
              <MenuItem icon="settings" label="Settings" path="/profile" isActive={pathname === '/profile'} />
              <MenuItem icon="log-out-outline" label="Log Out" isLogout={true} />
            </View>
          </View>

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#666' }}>SOUL SHUFFLE</Text>
            <Text style={{ fontSize: 9, fontWeight: '600', color: '#555', marginTop: 4 }}>v 1.1.1</Text>
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
