import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

interface PropertyShareData {
  id: string;
  name: string;
  price: number;
  address: string;
  image?: string;
}

interface UseShareReturn {
  shareProperty: (property: PropertyShareData) => Promise<boolean>;
  shareToSocialMedia: (property: PropertyShareData, platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram') => Promise<boolean>;
  generateShareText: (property: PropertyShareData) => string;
  generateShareUrl: (propertyId: string) => string;
}

export const useShare = (): UseShareReturn => {

  const generateShareUrl = (propertyId: string): string => {
    // Replace with your actual app domain
    const baseUrl = 'https://your-app-domain.com';
    return `${baseUrl}/property/${propertyId}`;
  };

  const generateShareText = (property: PropertyShareData): string => {
    const formattedPrice = typeof property.price === 'number' 
      ? property.price.toLocaleString() 
      : property.price;
    
    return `🏠 Check out this amazing property!\n\n${property.name}\n💰 $${formattedPrice}\n📍 ${property.address}\n\n${generateShareUrl(property.id)}`;
  };

  const shareProperty = async (property: PropertyShareData): Promise<boolean> => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Sharing not available',
          'Sharing is not available on this device'
        );
        return false;
      }

      const shareText = generateShareText(property);
      
      // For iOS and Android native sharing
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const { Share } = await import('react-native');
        
        const result = await Share.share({
          message: shareText,
          url: generateShareUrl(property.id), // iOS only
          title: `${property.name} - Real Estate`,
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Property shared successfully!');
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sharing property:', error);
      Alert.alert('Error', 'Failed to share property');
      return false;
    }
  };

  const shareToSocialMedia = async (
    property: PropertyShareData, 
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram'
  ): Promise<boolean> => {
    try {
      const shareText = generateShareText(property);
      const shareUrl = generateShareUrl(property.id);
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(shareUrl);

      let socialUrl = '';

      switch (platform) {
        case 'facebook':
          socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
          
        case 'twitter':
          socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
          
        case 'whatsapp':
          socialUrl = `https://wa.me/?text=${encodedText}`;
          break;
          
        case 'instagram':
          // Instagram doesn't support direct URL sharing
          // Instead, copy to clipboard and show instructions
          const Clipboard = await import('expo-clipboard');
          await Clipboard.setStringAsync(shareText);
          Alert.alert(
            'Instagram Sharing',
            'Text copied to clipboard! You can now paste it in your Instagram story or post.',
            [{ text: 'OK' }]
          );
          return true;
          
        default:
          return false;
      }

      if (socialUrl) {
        const Linking = await import('expo-linking');
        const canOpen = await Linking.canOpenURL(socialUrl);
        
        if (canOpen) {
          await Linking.openURL(socialUrl);
          Alert.alert('Success', `Opening ${platform} for sharing!`);
          return true;
        } else {
          // Fallback to clipboard
          const Clipboard = await import('expo-clipboard');
          await Clipboard.setStringAsync(shareText);
          Alert.alert(
            'Copied to Clipboard', 
            `${platform} is not available. Text copied to clipboard - you can paste it manually.`
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      Alert.alert('Error', `Failed to share to ${platform}`);
      return false;
    }
  };

  return {
    shareProperty,
    shareToSocialMedia,
    generateShareText,
    generateShareUrl,
  };
};