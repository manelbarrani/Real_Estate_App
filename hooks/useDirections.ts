import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

interface DirectionOptions {
  destinationLat: number;
  destinationLng: number;
  destinationName?: string;
  userLat?: number;
  userLng?: number;
}

interface UseDirectionsReturn {
  openInGoogleMaps: (options: DirectionOptions) => Promise<boolean>;
  openInAppleMaps: (options: DirectionOptions) => Promise<boolean>;
  openDirections: (options: DirectionOptions) => Promise<boolean>;
  getDirectionsUrl: (options: DirectionOptions, platform: 'google' | 'apple') => string;
}

export const useDirections = (): UseDirectionsReturn => {
  
  const getGoogleMapsUrl = ({
    destinationLat,
    destinationLng,
    destinationName,
    userLat,
    userLng
  }: DirectionOptions): string => {
    const destination = `${destinationLat},${destinationLng}`;
    const label = destinationName ? encodeURIComponent(destinationName) : '';
    
    if (userLat && userLng) {
      // With user location as starting point
      const origin = `${userLat},${userLng}`;
      return `https://www.google.com/maps/dir/${origin}/${destination}`;
    } else {
      // Open destination directly (Google Maps will handle current location)
      return `https://www.google.com/maps/search/?api=1&query=${destination}&query_place_id=${label}`;
    }
  };

  const getAppleMapsUrl = ({
    destinationLat,
    destinationLng,
    destinationName,
    userLat,
    userLng
  }: DirectionOptions): string => {
    const params = new URLSearchParams({
      daddr: `${destinationLat},${destinationLng}`,
      dirflg: 'd' // driving directions
    });

    if (destinationName) {
      params.append('dname', destinationName);
    }

    if (userLat && userLng) {
      params.append('saddr', `${userLat},${userLng}`);
    }

    return `http://maps.apple.com/?${params.toString()}`;
  };

  const getDirectionsUrl = (options: DirectionOptions, platform: 'google' | 'apple'): string => {
    return platform === 'apple' ? getAppleMapsUrl(options) : getGoogleMapsUrl(options);
  };

  const openInGoogleMaps = async (options: DirectionOptions): Promise<boolean> => {
    try {
      const url = getGoogleMapsUrl(options);
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web version
        const webUrl = getGoogleMapsUrl(options);
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      return false;
    }
  };

  const openInAppleMaps = async (options: DirectionOptions): Promise<boolean> => {
    try {
      const url = getAppleMapsUrl(options);
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error opening Apple Maps:', error);
      return false;
    }
  };

  const openDirections = async (options: DirectionOptions): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      // On iOS, try Apple Maps first, then Google Maps
      const appleSuccess = await openInAppleMaps(options);
      if (!appleSuccess) {
        return await openInGoogleMaps(options);
      }
      return true;
    } else {
      // On Android, use Google Maps
      return await openInGoogleMaps(options);
    }
  };

  return {
    openInGoogleMaps,
    openInAppleMaps,
    openDirections,
    getDirectionsUrl,
  };
};