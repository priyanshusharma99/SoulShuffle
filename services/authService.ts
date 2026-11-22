import api, { setMemoryToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANIMATED_AVATARS } from '@/constants/avatars';
import RevenueCatService from './revenueCatService';

// Helper to save tokens and profile cache atomically in a single batch
export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
  extra?: {
    rememberMe?: boolean;
    firstName?: string;
    userId?: string;
    avatarUrl?: string;
  }
) => {
  setMemoryToken(accessToken);

  const entries: [string, string][] = [
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
    ['rememberMe', extra?.rememberMe !== false ? 'true' : 'false'],
  ];

  if (extra?.firstName) {
    entries.push(['cachedUserName', extra.firstName]);
  }
  if (extra?.userId) {
    entries.push(['cachedUserId', extra.userId]);
    RevenueCatService.identify(extra.userId).catch(() => {});
  }
  
  // Guarantee a valid animated default avatar is set if none exists
  let resolvedAvatar = (extra?.avatarUrl && extra.avatarUrl !== 'null' && extra.avatarUrl !== 'undefined' && extra.avatarUrl.trim() !== '' && !extra.avatarUrl.includes('dicebear'))
    ? extra.avatarUrl
    : ANIMATED_AVATARS[0].url;
  if (resolvedAvatar.includes('cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/')) {
    resolvedAvatar = resolvedAvatar.replace('https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/', 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/');
  }
  entries.push(['cachedUserAvatar', resolvedAvatar]);

  // Atomic batch write to storage (1 disk cycle instead of 6+)
  await AsyncStorage.multiSet(entries);

  // Sync push token non-blockingly (fire-and-forget in background)
  AsyncStorage.getItem('expoPushToken')
    .then((pushToken) => {
      if (pushToken) {
        api.post('/notifications/register-push-token', { pushToken }).catch(() => {});
      }
    })
    .catch(() => {});
};

// Helper to clear user cache atomically
export const clearUserCache = async () => {
  setMemoryToken(null);
  RevenueCatService.logout().catch(() => {});
  await AsyncStorage.multiRemove([
    'accessToken',
    'refreshToken',
    'cachedUserName',
    'cachedUserId',
    'cachedUserAvatar'
  ]);
};

// ── SIGN UP ──────────────────────────────────────────────
export const signUp = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/signup', { name, email, password });
  const data = response.data.data;
  
  const enteredFirstName = (name || '').trim().split(' ')[0];
  const firstName = data?.user?.first_name 
    || data?.profile?.first_name 
    || data?.user?.name?.split(' ')[0] 
    || enteredFirstName;

  const defaultAvatar = ANIMATED_AVATARS[0].url;

  await saveTokens(data.accessToken, data.refreshToken, {
    firstName,
    userId: data?.user?.id,
    avatarUrl: data?.profile?.avatar_url || defaultAvatar,
  });

  // Ensure initial profile row exists on backend with default animated avatar
  updateMyProfile({ avatar_url: defaultAvatar, first_name: firstName }).catch(() => {});

  return data;
};

// ── SIGN IN ──────────────────────────────────────────────
export const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
  const response = await api.post('/auth/login', { email, password });
  const data = response.data.data;

  const firstName = data?.user?.first_name 
    || data?.profile?.first_name 
    || data?.user?.name?.split(' ')[0];

  await saveTokens(data.accessToken, data.refreshToken, {
    rememberMe,
    firstName,
    userId: data?.user?.id,
    avatarUrl: data?.profile?.avatar_url,
  });

  return data;
};

// ── GOOGLE LOGIN ─────────────────────────────────────────
export const googleLogin = async (googleIdToken: string) => {
  const response = await api.post('/auth/google', { token: googleIdToken });
  const data = response.data.data;

  const firstName = data?.user?.first_name 
    || data?.profile?.first_name 
    || data?.user?.name?.split(' ')[0];

  await saveTokens(data.accessToken, data.refreshToken, {
    firstName,
    userId: data?.user?.id,
    avatarUrl: data?.profile?.avatar_url,
  });

  return data;
};

// ── APPLE LOGIN ─────────────────────────────────────────
export const appleLogin = async (appleIdentityToken: string) => {
  const response = await api.post('/auth/apple', { token: appleIdentityToken });
  const data = response.data.data;

  const firstName = data?.user?.first_name 
    || data?.profile?.first_name 
    || data?.user?.name?.split(' ')[0];

  await saveTokens(data.accessToken, data.refreshToken, {
    firstName,
    userId: data?.user?.id,
    avatarUrl: data?.profile?.avatar_url,
  });

  return data;
};

// ── FORGOT PASSWORD ──────────────────────────────────────
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data.data || response.data;
};

// ── VERIFY OTP ───────────────────────────────────────────
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data.data || response.data;
};

// ── RESET PASSWORD ───────────────────────────────────────
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data.data || response.data;
};

// ── LOGOUT ───────────────────────────────────────────────
export const logout = async () => {
  setMemoryToken(null);
  await AsyncStorage.clear();
};

// ── GET MY PROFILE (raw API) ──────────────────────────────
export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data.data.profile;
};

// ── UPDATE MY PROFILE ─────────────────────────────────────
export const updateMyProfile = async (updateData: { first_name?: string; last_name?: string; avatar_url?: string; bio?: string }) => {
  const response = await api.put('/profile/me', updateData);
  if (updateData.avatar_url) {
    await AsyncStorage.setItem('cachedUserAvatar', updateData.avatar_url);
  }
  if (updateData.first_name) {
    await AsyncStorage.setItem('cachedUserName', updateData.first_name);
  }
  return response.data.data.profile;
};

// ── GET PROFILE WITH CACHING ─────────────────────────────
export const getMyProfileCached = async (): Promise<{ id: string | null; firstName: string; avatarUrl: string }> => {
  const cachedName = await AsyncStorage.getItem('cachedUserName');
  const cachedId = await AsyncStorage.getItem('cachedUserId');
  let cachedAvatar = await AsyncStorage.getItem('cachedUserAvatar');

  if (cachedAvatar && cachedAvatar.includes('cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/')) {
    cachedAvatar = cachedAvatar.replace('https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/', 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/');
    await AsyncStorage.setItem('cachedUserAvatar', cachedAvatar);
  }

  const isCachedAvatarValid = !!(cachedAvatar && cachedAvatar !== 'null' && cachedAvatar !== 'undefined' && cachedAvatar.trim() !== '' && !cachedAvatar.includes('dicebear'));

  if (!isCachedAvatarValid) {
    cachedAvatar = ANIMATED_AVATARS[0].url;
    await AsyncStorage.setItem('cachedUserAvatar', cachedAvatar);
  }

  if (cachedName && cachedName !== 'User' && cachedId) {
    return { id: cachedId, firstName: cachedName, avatarUrl: cachedAvatar! };
  }

  try {
    const profile = await getMyProfile();
    const firstName = profile?.first_name || profile?.users?.name?.split(' ')[0] || (cachedName && cachedName !== 'User' ? cachedName : '');
    const userId = profile?.id || cachedId || null;

    let backendAvatar = profile?.avatar_url;
    if (backendAvatar && backendAvatar.includes('cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/')) {
      backendAvatar = backendAvatar.replace('https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/', 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/');
    }

    const isBackendAvatarValid = !!(backendAvatar && backendAvatar !== 'null' && backendAvatar !== 'undefined' && backendAvatar.trim() !== '' && !backendAvatar.includes('dicebear'));

    let finalAvatar: string;
    if (isBackendAvatarValid) {
      finalAvatar = backendAvatar;
    } else if (isCachedAvatarValid) {
      // User already picked an avatar locally! Keep it permanent, never overwrite with default!
      finalAvatar = cachedAvatar!;
      updateMyProfile({ avatar_url: finalAvatar }).catch(() => {});
    } else {
      finalAvatar = ANIMATED_AVATARS[0].url;
      updateMyProfile({ avatar_url: finalAvatar }).catch(() => {});
    }

    if (firstName && firstName !== 'User') await AsyncStorage.setItem('cachedUserName', firstName);
    if (userId) await AsyncStorage.setItem('cachedUserId', userId);
    await AsyncStorage.setItem('cachedUserAvatar', finalAvatar);
    return { id: userId, firstName, avatarUrl: finalAvatar };
  } catch {
    return { id: cachedId ?? null, firstName: cachedName && cachedName !== 'User' ? cachedName : '', avatarUrl: cachedAvatar || ANIMATED_AVATARS[0].url };
  }
};