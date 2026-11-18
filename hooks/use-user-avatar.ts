import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANIMATED_AVATARS } from '@/constants/avatars';
import { useFocusEffect } from 'expo-router';

export const DEFAULT_AVATAR = ANIMATED_AVATARS[0].url;

export function useUserAvatar() {
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);

  // Reload avatar from cache every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadAvatar = async () => {
        try {
          const cached = await AsyncStorage.getItem('cachedUserAvatar');
          if (cached && cached !== 'null' && cached !== 'undefined' && cached.trim() !== '' && !cached.includes('dicebear')) {
            if (isMounted) setAvatar(cached);
          } else {
            // Automatically set and persist default avatar so user NEVER sees a blank icon
            if (isMounted) setAvatar(DEFAULT_AVATAR);
            AsyncStorage.setItem('cachedUserAvatar', DEFAULT_AVATAR).catch(() => {});
          }
        } catch (err) {
          console.log('Failed to load cached avatar:', err);
        }
      };

      loadAvatar();

      const sub = DeviceEventEmitter.addListener('profile:updated', (data) => {
        const newUrl = data?.avatarUrl;
        const valid = (newUrl && newUrl !== 'null' && newUrl !== 'undefined' && newUrl.trim() !== '' && !newUrl.includes('dicebear'))
          ? newUrl
          : DEFAULT_AVATAR;
        if (isMounted) {
          setAvatar(valid);
          // Also persist to cache in case it wasn't already
          AsyncStorage.setItem('cachedUserAvatar', valid).catch(() => {});
        }
      });

      return () => {
        isMounted = false;
        sub.remove();
      };
    }, [])
  );

  return avatar || DEFAULT_AVATAR;
}
