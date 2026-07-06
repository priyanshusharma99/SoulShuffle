import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import GameSocket from '@/services/socketService';

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

  // ── Socket: listen for new_notification event ──────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const setupSocketListener = () => {
      const socket = GameSocket.socket;
      if (!socket || listenerRegistered.current) return;

      socket.on('new_notification', (notification: AppNotification) => {
        console.log('[NotificationContext] new_notification received:', notification);

        // Prepend to list
        setNotifications(prev => [notification, ...prev]);

        // Bump unread count
        setUnreadCount(prev => prev + 1);
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
