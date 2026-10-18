import { Alert, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { googleLogin } from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reliable check for whether the app is currently running inside the Expo Go sandbox
export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).executionEnvironment === 'storeClient';

export const GOOGLE_WEB_CLIENT_ID = '950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com';

/**
 * Triggers Google Sign-In safely.
 * Returns true if login was successful, false if cancelled or unsupported.
 */
export const promptGoogleSignIn = async (): Promise<boolean> => {
  // 1. In Expo Go, native third-party modules like RNGoogleSignin cannot run
  // because they are not compiled into the prebuilt Expo Go client binary.
  if (isExpoGo) {
    Alert.alert(
      'Expo Go Limitation',
      'Google Sign-In requires native device libraries that are not supported inside the standard Expo Go client.\n\n' +
      '• To use Google Sign-In, please run a development build:\n' +
      '  npx expo run:android  or  npx expo run:ios\n\n' +
      '• In Expo Go, please use your Email and Password to sign in or register.',
      [{ text: 'Understood' }]
    );
    return false;
  }

  // 2. In a Development or Production build, safely load @react-native-google-signin/google-signin
  let GoogleSignin: any = null;
  let statusCodes: any = null;

  try {
    const rns = require('@react-native-google-signin/google-signin');
    GoogleSignin = rns?.GoogleSignin;
    statusCodes = rns?.statusCodes;
  } catch (err: any) {
    console.warn('[GoogleAuth] Native module not registered:', err?.message);
    Alert.alert(
      'Google Sign-In Unavailable',
      'The Google Sign-In native module is not registered in this binary. Please ensure you are running a development build.'
    );
    return false;
  }

  if (!GoogleSignin) {
    Alert.alert(
      'Google Sign-In Unavailable',
      'Google Sign-In is unavailable in this build.'
    );
    return false;
  }

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.data?.idToken || userInfo?.idToken;

    if (!idToken) {
      throw new Error('Google Sign-In failed: No ID Token returned');
    }

    await googleLogin(idToken);
    await AsyncStorage.setItem('rememberMe', 'true');
    return true;
  } catch (error: any) {
    console.log('[GoogleAuth] Sign-in error:', error);

    // Safely check for cancellation without assuming statusCodes is present
    if (
      (statusCodes && error?.code === statusCodes.SIGN_IN_CANCELLED) ||
      error?.code === '12501' ||
      error?.message?.includes?.('canceled') ||
      error?.message?.includes?.('cancelled')
    ) {
      // User cancelled, gracefully return false
      return false;
    }

    if (statusCodes && error?.code === statusCodes.IN_PROGRESS) {
      return false;
    }

    if (
      (statusCodes && error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) ||
      error?.code === '12500'
    ) {
      Alert.alert('Error', 'Google Play Services is not available or outdated on this device.');
      return false;
    }

    const message = error?.response?.data?.message || error?.message || 'Google Sign-In failed';
    Alert.alert('Login Failed', message);
    return false;
  }
};

/**
 * Clears Google session on logout if available.
 */
export const signOutGoogle = async (): Promise<void> => {
  if (isExpoGo) {
    console.log('[LOGOUT] Skipping Google logout (Expo Go mode).');
    return;
  }

  try {
    const rns = require('@react-native-google-signin/google-signin');
    const GoogleSignin = rns?.GoogleSignin;
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
      });
      try { await GoogleSignin.signInSilently(); } catch (e) {}
      await GoogleSignin.signOut();
      console.log('[LOGOUT] Google session cleared.');
      try { await GoogleSignin.revokeAccess(); } catch (e) {}
    }
  } catch (googleErr) {
    console.log('[LOGOUT] Google sign out error (ignoring):', googleErr);
  }
};
