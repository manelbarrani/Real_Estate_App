import { useShare } from '@/hooks/useShare';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PropertyData {
  id: string;
  name: string;
  price: number;
  address: string;
  image?: string;
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  property: PropertyData;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  property,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { shareProperty, shareToSocialMedia } = useShare();

  const handleShare = async (platform?: 'facebook' | 'twitter' | 'whatsapp' | 'instagram') => {
    try {
      setLoading(platform || 'general');
      
      let success = false;
      if (platform) {
        success = await shareToSocialMedia(property, platform);
      } else {
        success = await shareProperty(property);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share property');
    } finally {
      setLoading(null);
    }
  };

  const shareOptions = [
    {
      id: 'general',
      name: 'Share',
      icon: 'share-outline',
      color: '#666',
      onPress: () => handleShare(),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      onPress: () => handleShare('whatsapp'),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: '#1877F2',
      onPress: () => handleShare('facebook'),
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      onPress: () => handleShare('twitter'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      onPress: () => handleShare('instagram'),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Property</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName} numberOfLines={2}>
              {property.name}
            </Text>
            <Text style={styles.propertyPrice}>
              ${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}
            </Text>
            <Text style={styles.propertyAddress} numberOfLines={2}>
              {property.address}
            </Text>
          </View>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.shareButton}
                onPress={option.onPress}
                disabled={loading !== null}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}15` }]}>
                  {loading === option.id ? (
                    <ActivityIndicator size="small" color={option.color} />
                  ) : (
                    <Ionicons name={option.icon as any} size={24} color={option.color} />
                  )}
                </View>
                <Text style={styles.shareButtonText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading !== null}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area padding
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  propertyInfo: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
  },
  shareOptions: {
    paddingVertical: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default ShareModal;