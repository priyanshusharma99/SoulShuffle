import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform, Linking, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import api from '@/services/api';
import GameSocket from '@/services/socketService';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  (Constants as any).executionEnvironment === 'storeClient';

// ─── Safely Load expo-notifications ──────────────────────────────────────────
// In Expo SDK 53+, importing expo-notifications statically on Android in Expo Go
// throws an immediate fatal error during module evaluation. We load it lazily.
let Notifications: any = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (err) {
    console.warn('[Notifications] Failed to load expo-notifications:', err);
    Notifications = null;
  }
}

// ─── Configure how notifications appear when the app is in the foreground ─────
try {
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.warn('[Notifications] setNotificationHandler error:', e);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: {
    room_id?: string;
    send_id?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: AppNotification[];
  isLoading: boolean;
  expoPushToken: string | null;
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  registerPushTokenWithBackend: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Setup Android Notification Channel ─────────────────────────────────────
let channelRegistered = false;
const setupAndroidChannel = async () => {
  if (channelRegistered) return;
  if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SoulShuffle Notifications',
        description: 'Game alerts, partner dares, penalties, and reminders',
        importance: Notifications?.AndroidImportance?.MAX ?? 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e11d48',
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
        lockscreenVisibility: Notifications?.AndroidNotificationVisibility?.PUBLIC ?? 1,
        bypassDnd: false,
      });
      channelRegistered = true;
      console.log('[Notifications] Android default notification channel registered');
    } catch (e) {
      console.warn('[Notifications] setupAndroidChannel error:', e);
    }
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const listenerRegistered = useRef(false);
  const lastRegisteredTokenRef = useRef<string | null>(null);
  const isRegisteringTokenRef = useRef(false);

  // Fetch unread count from REST API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data?.data?.unread_count ?? 0);
    } catch (e) {
      // silently fail — bell will just show 0
    }
  }, []);

  // Fetch notification list
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/notifications?page=${page}&limit=20`);
      const list: AppNotification[] = res.data?.data?.notifications ?? [];
      if (page === 1) {
        setNotifications(list);
      } else {
        setNotifications(prev => {
          const newMap = new Map(prev.map(n => [n.id, n]));
          list.forEach(n => newMap.set(n.id, n));
          return Array.from(newMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
      }
    } catch (e) {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {}
  }, []);

  // Register push token with backend
  const registerPushTokenWithBackend = useCallback(async () => {
    if (Platform.OS === 'web') return;
    if (!Notifications) {
      return;
    }

    if (isRegisteringTokenRef.current) return;
    isRegisteringTokenRef.current = true;

    try {
      // 1. Ensure Android Channel is registered
      await setupAndroidChannel();

      // 2. Request / verify permissions
      let finalStatus = 'undetermined';
      try {
        const permResult = await Notifications?.getPermissionsAsync?.();
        const existingStatus = permResult?.status;
        finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const reqResult = await Notifications?.requestPermissionsAsync?.({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          finalStatus = reqResult?.status;
        }
      } catch (permErr) {
        console.warn('[Notifications] Permission error:', permErr);
        return;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted.');
        return;
      }

      // 3. Obtain Expo Push Token using real EAS projectId
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        'a8229d2a-b2bf-4176-a245-2016dc5e11f1';

      try {
        let tokenResult: any = null;
        try {
          tokenResult = await Notifications?.getExpoPushTokenAsync?.({
            projectId,
          });
        } catch (projErr) {
          console.warn('[Notifications] getExpoPushTokenAsync with projectId failed, trying default:', projErr);
          tokenResult = await Notifications?.getExpoPushTokenAsync?.();
        }

        const pushToken = tokenResult?.data;
        console.log('[Notifications] Push Token obtained:', pushToken);
        if (pushToken) {
          setExpoPushToken(pushToken);
          await AsyncStorage.setItem('expoPushToken', pushToken);
        }

        // 4. Send token to backend if user is logged in
        const tokenToSend = pushToken || (await AsyncStorage.getItem('expoPushToken'));
        if (tokenToSend) {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (accessToken && lastRegisteredTokenRef.current !== tokenToSend) {
            try {
              await api.post('/notifications/register-push-token', { pushToken: tokenToSend });
              lastRegisteredTokenRef.current = tokenToSend;
              console.log('[Notifications] Push token successfully registered on backend:', tokenToSend);
            } catch (apiErr) {
              console.warn('[Notifications] Failed to send push token to backend:', apiErr);
            }
          }
        }
      } catch (tokenErr) {
        console.warn('[Notifications] Failed to obtain push token:', tokenErr);
      }
    } catch (err) {
      console.warn('[Notifications] registerPushTokenWithBackend error:', err);
    } finally {
      isRegisteringTokenRef.current = false;
    }
  }, []);

  // ── Register Push Token and Channel on mount ──────────────
  useEffect(() => {
    setupAndroidChannel();
    registerPushTokenWithBackend();
  }, [registerPushTokenWithBackend]);

  // ── Re-sync on AppState foreground transition ──────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchUnreadCount();
        registerPushTokenWithBackend();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [fetchUnreadCount, registerPushTokenWithBackend]);

  // ── Handle Tap on Push Notification (Foreground / Background / Killed) ──
  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications?.addNotificationResponseReceivedListener) return;

    let responseSubscription: any;
    try {
      responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
        setTimeout(() => {
          try {
            const data = response?.notification?.request?.content?.data;
            if (data?.room_id || data?.send_id || data?.card_id) {
              router.push('/(tabs)');
              const { DeviceEventEmitter } = require('react-native');
              DeviceEventEmitter.emit('app:openCardSend', data);
            } else {
              router.push('/notifications');
            }
          } catch (err) {
            console.warn('[Notifications] notification tap navigation error:', err);
          }
        }, 500);
      });
    } catch (subErr) {
      console.warn('[Notifications] addNotificationResponseReceivedListener error:', subErr);
    }

    return () => {
      if (responseSubscription?.remove) {
        responseSubscription.remove();
      }
    };
  }, []);

  // ── Socket: listen for new_notification event (foreground live count & system tray notification) ──
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let attempts = 0;

    const setupSocketListener = () => {
      const socket = GameSocket.socket;
      if (!socket || listenerRegistered.current) return;

      socket.on('new_notification', async (notification: AppNotification) => {
        console.log('[NotificationContext] new_notification received:', notification);

        // Prepend to in-app list (prevent duplicates)
        setNotifications(prev => {
          if (prev.some(n => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });

        // Bump unread count
        setUnreadCount(prev => prev + 1);

        // Display in Android/iOS system notification bar!
        if (Notifications?.scheduleNotificationAsync) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notification.title || 'SoulShuffle',
                body: notification.body || 'You received a new card update!',
                data: notification.data || {},
                channelId: 'default',
                sound: 'default',
                badge: 1,
              },
              trigger: null, // Display immediately in system tray
            });
          } catch (localErr) {
            console.warn('[NotificationContext] Failed to post local notification:', localErr);
          }
        }

        // Trigger beautiful in-app modal if it's a stolen penalty card
        if (notification.type === 'PENALTY_CARD_STOLEN' && notification.data) {
          const { DeviceEventEmitter } = require('react-native');
          DeviceEventEmitter.emit('app:showPenaltyGift', notification.data);
        }
      });

      listenerRegistered.current = true;
      if (interval) clearInterval(interval);
    };

    // Try immediately, then poll every 2s until socket is ready (max 15 attempts / 30s)
    setupSocketListener();
    interval = setInterval(() => {
      attempts++;
      if (GameSocket.socket && !listenerRegistered.current) {
        setupSocketListener();
      }
      if (listenerRegistered.current || attempts >= 15) {
        clearInterval(interval);
      }
    }, 2000);

    // Fetch initial unread count
    fetchUnreadCount();

    return () => {
      clearInterval(interval);
      if (GameSocket.socket) {
        GameSocket.socket.off('new_notification');
      }
      listenerRegistered.current = false;
    };
  }, [fetchUnreadCount]);

  // Send instant test notification (tests both backend push and Android local tray)
  const sendTestNotification = useCallback(async () => {
    try {
      // 1. Post to backend test endpoint to test remote push delivery
      await api.post('/notifications/send-test', {
        title: 'SoulShuffle Test 🔔',
        body: 'Remote push notifications are working perfectly!',
      }).catch(() => {});

      // 2. Also trigger instant notification directly in device notification bar
      if (Notifications?.scheduleNotificationAsync) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'SoulShuffle Notification Bar 🔔',
            body: 'If you see this in your notification bar, permissions & system tray are working!',
            sound: 'default',
            channelId: 'default',
            badge: 1,
          },
          trigger: null,
        });
      }
    } catch (e) {
      console.warn('[NotificationContext] sendTestNotification error:', e);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        isLoading,
        expoPushToken,
        fetchUnreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        registerPushTokenWithBackend,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
