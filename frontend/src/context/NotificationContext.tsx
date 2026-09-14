import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { subscribeToPushNotifications } from '../utils/pushManager';
import { playNotificationSound, isSoundEnabled, setSoundEnabled } from '../utils/soundManager';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(isSoundEnabled());
  const prevUnreadCountRef = useRef<number | null>(null);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    setSoundEnabledState(nextState);
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadCountRef.current = null;
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const fetched: NotificationItem[] = res.data.notifications || [];
      const newUnread: number = res.data.unreadCount || 0;

      // Play sound chime if unread count increased after initial load
      if (prevUnreadCountRef.current !== null && newUnread > prevUnreadCountRef.current) {
        playNotificationSound();
      }

      prevUnreadCountRef.current = newUnread;
      setNotifications(fetched);
      setUnreadCount(newUnread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToPushNotifications().catch(() => {});
    }

    // Poll for new notifications every 5 seconds for rapid alert delivery
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        prevUnreadCountRef.current = next;
        return next;
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        soundEnabled,
        toggleSound,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
