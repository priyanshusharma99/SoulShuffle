import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import api from '@/services/api';
import GameSocket from '@/services/socketService';

// ─── Configure how notifications appear when the app is in the foreground ─────
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[Notifications] Not supported in this environment (likely Expo Go).');
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
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const listenerRegistered = useRef(false);

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
        setNotifications(prev => [...prev, ...list]);
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

  // ── Request Android notification permission on first launch ────────────────
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'web') return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        if (existingStatus === 'granted') return; // Already allowed — do nothing

        if (existingStatus === 'denied') {
          // User previously denied — can only fix via Settings now
          Alert.alert(
            'Notifications Disabled',
            'SoulShuffle notifications are disabled. To get dare alerts and partner updates, please enable notifications in your device Settings.',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }

        // First time — show the system permission dialog
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

        if (status !== 'granted') {
          console.log('[Notifications] Permission not granted by user.');
        } else {
          console.log('[Notifications] Permission granted.');
        }
      } catch (error) {
        console.warn('[Notifications] requestPermissionsAsync failed (Expo Go limitation).');
      }
    };

    requestNotificationPermission();
  }, []);

  // ── Socket: listen for new_notification event ──────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const setupSocketListener = () => {
      const socket = GameSocket.socket;
      if (!socket || listenerRegistered.current) return;

      socket.on('new_notification', async (notification: AppNotification) => {
        console.log('[NotificationContext] new_notification received:', notification);

        // Prepend to list
        setNotifications(prev => [notification, ...prev]);

        // Bump unread count
        setUnreadCount(prev => prev + 1);

        // Trigger OS-level local notification
        if (Platform.OS !== 'web') {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
              },
              trigger: null, // trigger immediately
            });
          } catch (e) {
            console.warn('[Notifications] scheduleNotificationAsync failed (Expo Go limitation).');
          }
        }
      });

      listenerRegistered.current = true;
    };

    // Try immediately, then poll every 2s until socket is ready
    setupSocketListener();
    interval = setInterval(() => {
      if (GameSocket.socket && !listenerRegistered.current) {
        setupSocketListener();
      }
      if (listenerRegistered.current) {
        clearInterval(interval);
      }
    }, 2000);

    // Fetch initial unread count
    fetchUnreadCount();

    return () => {
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        isLoading,
        fetchUnreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
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
