import { useEffect, useState } from 'react';
import { getUserConversations } from './appwrite';
import { useGlobalContext } from './global-provider';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useGlobalContext();

  const updateUnreadCount = async () => {
    if (!user?.$id) {
      setUnreadCount(0);
      return;
    }

    try {
      const conversations = await getUserConversations(user.$id);
      let totalUnread = 0;

      // Compte simple : conversations non lues par l'utilisateur
      for (const conv of conversations) {
        if (!conv.isRead && conv.lastMessageSender !== user.$id) {
          totalUnread++;
        }
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Erreur lors du calcul des messages non lus:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    updateUnreadCount();

    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(updateUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user?.$id]);

  return { unreadCount, updateUnreadCount };
};