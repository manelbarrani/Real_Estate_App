import icons from '@/constants/icons';
import { LocationObject } from 'expo-location';
import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

interface LocationStatusProps {
  userLocation: LocationObject | null;
  locationLoading: boolean;
  locationError: string | null;
  nearbyCount?: number;
}

export default function LocationStatus({ 
  userLocation, 
  locationLoading, 
  locationError, 
  nearbyCount 
}: LocationStatusProps) {
  if (locationLoading) {
    return (
      <View className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="ml-2 text-blue-700 font-rubik-medium text-sm">
            Getting your location...
          </Text>
        </View>
      </View>
    );
  }

  if (locationError) {
    return (
      <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
        <View className="flex-row items-center">
          <Image source={icons.location} className="w-4 h-4" tintColor="#DC2626" />
          <Text className="ml-2 text-red-700 font-rubik-medium text-sm">
            Location unavailable
          </Text>
        </View>
        <Text className="text-red-600 text-xs mt-1">
          {locationError}
        </Text>
      </View>
    );
  }

  if (userLocation) {
    return (
      <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image source={icons.location} className="w-4 h-4" tintColor="#059669" />
            <Text className="ml-2 text-green-700 font-rubik-medium text-sm">
              Location found
            </Text>
          </View>
          {nearbyCount !== undefined && (
            <Text className="text-green-600 font-rubik-bold text-sm">
              {nearbyCount} nearby
            </Text>
          )}
        </View>
        <Text className="text-green-600 text-xs mt-1">
          Lat: {userLocation.coords.latitude.toFixed(4)}, 
          Lng: {userLocation.coords.longitude.toFixed(4)}
        </Text>
      </View>
    );
  }

  return null;
}