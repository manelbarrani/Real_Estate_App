import { useEffect, useState } from 'react';
import { client, config, ConversationDocument, MessageDocument } from './appwrite';


export interface ChatRealtimeHook {
  conversations: ConversationDocument[];
  messages: MessageDocument[];
  isConnected: boolean;
  subscribeToConversations: () => void;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeFromConversations: () => void;
  unsubscribeFromMessages: () => void;
}

export function useChatRealtime(): ChatRealtimeHook {
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationSubscription, setConversationSubscription] = useState<any>(null);
  const [messageSubscription, setMessageSubscription] = useState<any>(null);

  // Helper functions removed - functionality implemented inline

  // Subscribe to conversations updates
  const subscribeToConversations = () => {
    try {
      const subscription = client.subscribe(
        `databases.${config.databaseId}.collections.${config.conversationsCollectionId}.documents`,
        (response: any) => {
          try {
            console.log('Conversation realtime event:', response);
            
            const payload = response.payload as ConversationDocument;
            
            // Handle different event types
            switch (response.events[0]) {
              case `databases.${config.databaseId}.collections.${config.conversationsCollectionId}.documents.*.create`:
                setConversations(prev => [payload, ...prev]);
                break;
                
              case `databases.${config.databaseId}.collections.${config.conversationsCollectionId}.documents.*.update`:
                setConversations(prev => 
                  prev.map(conv => 
                    conv.$id === payload.$id ? payload : conv
                  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                );
                break;
                
              case `databases.${config.databaseId}.collections.${config.conversationsCollectionId}.documents.*.delete`:
                setConversations(prev => prev.filter(conv => conv.$id !== payload.$id));
                break;
            }
            
            setIsConnected(true);
          } catch (error) {
            console.error('Conversation subscription error:', error);
            setIsConnected(false);
          }
        }
      );
      
      setConversationSubscription(subscription);
      console.log('Subscribed to conversations');
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
    }
  };

  // Subscribe to messages updates
  const subscribeToMessages = (conversationId: string) => {
    try {
      const subscription = client.subscribe(
        `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents`,
        (response: any) => {
          try {
            console.log('Message realtime event:', response);
            
            const payload = response.payload as MessageDocument;
            
            // Only handle messages for the current conversation
            if (payload.conversationId !== conversationId) {
              return;
            }
            
            // Handle different event types
            switch (response.events[0]) {
              case `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents.*.create`:
                setMessages(prev => [...prev, payload]);
                break;
                
              case `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents.*.update`:
                setMessages(prev => 
                  prev.map(msg => 
                    msg.$id === payload.$id ? payload : msg
                  )
                );
                break;
                
              case `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents.*.delete`:
                setMessages(prev => prev.filter(msg => msg.$id !== payload.$id));
                break;
            }
          } catch (error) {
            console.error('Message subscription error:', error);
          }
        }
      );
      
      setMessageSubscription(subscription);
      console.log('Subscribed to messages for conversation:', conversationId);
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  // Unsubscribe from conversations
  const unsubscribeFromConversations = () => {
    if (conversationSubscription) {
      conversationSubscription();
      setConversationSubscription(null);
      console.log('Unsubscribed from conversations');
    }
  };

  // Unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (messageSubscription) {
      messageSubscription();
      setMessageSubscription(null);
      setMessages([]);
      console.log('Unsubscribed from messages');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromConversations();
      unsubscribeFromMessages();
    };
  }, []);

  return {
    conversations,
    messages,
    isConnected,
    subscribeToConversations,
    subscribeToMessages,
    unsubscribeFromConversations,
    unsubscribeFromMessages,
  };
}