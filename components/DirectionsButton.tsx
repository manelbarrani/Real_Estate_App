import { useDirections } from '@/hooks/useDirections';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  propertyName?: string;
  userLatitude?: number;
  userLongitude?: number;
  size?: number;
  color?: string;
  style?: any;
}

const DirectionsButton: React.FC<DirectionsButtonProps> = ({
  latitude,
  longitude,
  propertyName,
  userLatitude,
  userLongitude,
  size = 24,
  color = '#007AFF',
  style = {},
}) => {
  const { openDirections } = useDirections();

  const handleDirections = async () => {
    try {
      const success = await openDirections({
        destinationLat: latitude,
        destinationLng: longitude,
        destinationName: propertyName,
        userLat: userLatitude,
        userLng: userLongitude,
      });

      if (!success) {
        Alert.alert(
          'Navigation Error',
          'Unable to open maps application. Please ensure you have Google Maps or Apple Maps installed.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Directions error:', error);
      Alert.alert('Error', 'Failed to open directions');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDirections}
      style={[
        {
          padding: 8,
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style
      ]}
      accessibilityLabel="Get directions"
      accessibilityHint="Opens directions to this property in your preferred maps app"
    >
      <Ionicons name="navigate" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default DirectionsButton;