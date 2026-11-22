import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANIMATED_AVATARS } from '@/constants/avatars';
import { useFocusEffect } from 'expo-router';

export const DEFAULT_AVATAR = ANIMATED_AVATARS[0].url;

function sanitizeAvatarUrl(url?: string | null): string {
  if (!url || url === 'null' || url === 'undefined' || url.trim() === '' || url.includes('dicebear')) {
    return DEFAULT_AVATAR;
  }
  if (url.includes('cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/')) {
    return url.replace('https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/', 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/');
  }
  return url;
}

export function useUserAvatar() {
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);

  // Reload avatar from cache every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadAvatar = async () => {
        try {
          const rawCached = await AsyncStorage.getItem('cachedUserAvatar');
          const cleanAvatar = sanitizeAvatarUrl(rawCached);

          if (isMounted) setAvatar(cleanAvatar);

          // Update cache if sanitized URL differs from stored (e.g. upgraded from jsdelivr/dicebear)
          if (rawCached !== cleanAvatar) {
            AsyncStorage.setItem('cachedUserAvatar', cleanAvatar).catch(() => {});
          }
        } catch (err) {
          console.log('Failed to load cached avatar:', err);
        }
      };

      loadAvatar();

      const sub = DeviceEventEmitter.addListener('profile:updated', (data) => {
        const cleanAvatar = sanitizeAvatarUrl(data?.avatarUrl);
        if (isMounted) {
          setAvatar(cleanAvatar);
          AsyncStorage.setItem('cachedUserAvatar', cleanAvatar).catch(() => {});
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
