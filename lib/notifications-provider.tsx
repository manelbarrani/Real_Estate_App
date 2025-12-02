import {
    NotificationCategory,
    NotificationPreferencesDocument,
    NotificationPriority,
    NotificationType,
    client,
    config,
    createNotification,
    getNotificationPreferences,
    getUnreadNotificationCount,
    shouldSendNotification,
    updateNotificationPreferences
} from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface NotificationsContextType {
  unreadCount: number;
  preferences: NotificationPreferencesDocument | null;
  refreshUnreadCount: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<NotificationPreferencesDocument>) => Promise<void>;
  sendNotification: (data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    category: NotificationCategory;
    priority?: NotificationPriority;
    actionUrl?: string;
    imageUrl?: string;
    data?: Record<string, any>;
  }) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useGlobalContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferencesDocument | null>(null);

  // Fetch unread count
  const refreshUnreadCount = async () => {
    if (!user?.$id) return;
    
    try {
      const count = await getUnreadNotificationCount(user.$id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch preferences
  const refreshPreferences = async () => {
    if (!user?.$id) return;
    
    try {
      const prefs = await getNotificationPreferences(user.$id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Update preferences
  const updatePrefs = async (updates: Partial<NotificationPreferencesDocument>) => {
    if (!preferences) return;
    
    try {
      const updated = await updateNotificationPreferences(preferences.$id, updates);
      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  // Send notification (with preference check)
  const sendNotification = async (data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    category: NotificationCategory;
    priority?: NotificationPriority;
    actionUrl?: string;
    imageUrl?: string;
    data?: Record<string, any>;
  }) => {
    try {
      // Check if user has enabled notifications for this category
      const shouldSend = await shouldSendNotification(data.userId, data.category);
      
      if (!shouldSend) {
        console.log(`Notification blocked by user preferences: ${data.category}`);
        return;
      }

      await createNotification(data);
      
      // Refresh unread count if the notification is for the current user
      if (user?.$id === data.userId) {
        await refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.$id) return;

    // Initial fetch
    refreshUnreadCount();
    refreshPreferences();

    // Subscribe to notification changes
    const unsubscribe = client.subscribe(
      `databases.${config.databaseId}.collections.${config.notificationsCollectionId}.documents`,
      (response: any) => {
        // Refresh count when new notification arrives for current user
        if (
          response.events.includes('databases.*.collections.*.documents.*.create') &&
          response.payload.userId === user.$id
        ) {
          refreshUnreadCount();
        }
        
        // Refresh count when notification is marked as read
        if (
          response.events.includes('databases.*.collections.*.documents.*.update') &&
          response.payload.userId === user.$id
        ) {
          refreshUnreadCount();
        }
        
        // Refresh count when notification is deleted
        if (
          response.events.includes('databases.*.collections.*.documents.*.delete')
        ) {
          refreshUnreadCount();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.$id]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!user?.$id) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.$id]);

  const value: NotificationsContextType = {
    unreadCount,
    preferences,
    refreshUnreadCount,
    refreshPreferences,
    updatePreferences: updatePrefs,
    sendNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return context;
}
