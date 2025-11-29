import { MessageDocument } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessageBubbleProps {
  message: MessageDocument;
  onImagePress?: (imageUrl: string) => void;
  onLongPress?: (message: MessageDocument) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onImagePress,
  onLongPress 
}) => {
  const { user } = useGlobalContext();
  const isMyMessage = message.senderId === user?.$id;

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(message);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = () => {
    if (message.messageType === 'image' && message.imageUrl) {
      return (
        <TouchableOpacity onPress={() => onImagePress?.(message.imageUrl!)}>
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
          {message.content && message.content !== '📷 Image' && (
            <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
              {message.content}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
        {message.content}
      </Text>
    );
  };

  return (
    <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}
      >
        {renderMessageContent()}
        
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, isMyMessage ? styles.myTimeText : styles.otherTimeText]}>
            {formatTime(message.$createdAt)}
          </Text>
          
          {isMyMessage && (
            <View style={styles.statusIcons}>
              {message.isDelivered && (
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color={message.isRead ? "#4CAF50" : "#999"} 
                />
              )}
              {message.isRead && (
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color="#4CAF50" 
                  style={{ marginLeft: -6 }}
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    marginTop: 2,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#888',
  },
  statusIcons: {
    flexDirection: 'row',
    marginLeft: 4,
  },
});

export default MessageBubble;