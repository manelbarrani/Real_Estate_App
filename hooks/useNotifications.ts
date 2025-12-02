import {
    NotificationCategory,
    NotificationDocument,
    deleteNotification,
    deleteReadNotifications,
    getUnreadNotificationCount,
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useCallback, useEffect, useState } from 'react';

interface UseNotificationsOptions {
  limit?: number;
  onlyUnread?: boolean;
  category?: NotificationCategory;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    limit = 50,
    onlyUnread = false,
    category,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // Fetch notifications
  const fetchNotifications = useCallback(async (isRefreshing = false) => {
    if (!user?.$id) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [notificationsData, count] = await Promise.all([
        getUserNotifications(user.$id, { limit, onlyUnread, category }),
        getUnreadNotificationCount(user.$id),
      ]);

      setNotifications(notificationsData.documents);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id, limit, onlyUnread, category]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.$id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.$id) return;

    try {
      await markAllNotificationsAsRead(user.$id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, [user?.$id]);

  // Delete notification
  const deleteOne = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.$id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.$id !== notificationId);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!user?.$id) return;

    try {
      await deleteReadNotifications(user.$id);
      
      // Update local state
      setNotifications((prev) => prev.filter((notif) => !notif.isRead));
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      throw err;
    }
  }, [user?.$id]);

  // Refresh notifications
  const refresh = useCallback(() => {
    return fetchNotifications(true);
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user?.$id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications, user?.$id]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAllRead,
    refresh,
  };
}
