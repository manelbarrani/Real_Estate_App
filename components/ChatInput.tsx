import { sendImageMessage, sendMessage } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChatInputProps {
  conversationId: string;
  receiverId: string;
  onMessageSent?: () => void;
  onMessageStart?: (messageText: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  conversationId,
  receiverId,
  onMessageSent,
  onMessageStart,
  onTyping,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTyping = (text: string) => {
    setMessage(text);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        onTyping(false);
      }, 2000);
      
      setTypingTimeout(timeout as unknown as NodeJS.Timeout);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);
    
    // Stop typing indicator
    if (onTyping) {
      onTyping(false);
    }
    
    // Afficher immédiatement le message (optimistic update)
    if (onMessageStart) {
      onMessageStart(messageText);
    }

    try {
      const result = await sendMessage(conversationId, receiverId, messageText);
      
      if (result.success) {
        onMessageSent?.();
      } else {
        // Restore message on failure
        setMessage(messageText);
        Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à vos photos pour envoyer des images.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSending(true);
        
        try {
          const imageResult = await sendImageMessage(
            conversationId,
            receiverId,
            result.assets[0].uri
          );
          
          if (imageResult.success) {
            onMessageSent?.();
          } else {
            Alert.alert('Erreur', 'Impossible d\'envoyer l\'image');
          }
        } catch (error) {
          console.error('Error sending image:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'image');
        } finally {
          setSending(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder aux photos');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={handleImagePick}
        disabled={sending}
      >
        <Ionicons 
          name="image" 
          size={24} 
          color={sending ? "#ccc" : "#007AFF"} 
        />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={handleTyping}
          placeholder="Tapez votre message..."
          placeholderTextColor="#888"
          multiline
          maxLength={1000}
          editable={!sending}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!message.trim() || sending) && styles.sendButtonDisabled
        ]}
        onPress={handleSendMessage}
        disabled={!message.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons 
            name="send" 
            size={20} 
            color="#FFFFFF" 
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ChatInput;