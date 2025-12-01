import { PropertyDocument } from '@/components/Cards';
import icons from '@/constants/icons';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

interface PropertyQuickListProps {
  properties: PropertyDocument[];
  onPropertyPress: (id: string) => void;
  maxItems?: number;
}

export default function PropertyQuickList({ 
  properties, 
  onPropertyPress,
  maxItems = 5
}: PropertyQuickListProps) {
  const displayProperties = properties.slice(0, maxItems);

  const renderProperty = ({ item }: { item: PropertyDocument }) => (
    <TouchableOpacity
      onPress={() => onPropertyPress(item.$id)}
      className="flex-row items-center p-3 bg-white rounded-lg border border-gray-100 mb-2"
    >
      <Image
        source={{ uri: item.image }}
        className="w-16 h-16 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <Text className="font-rubik-bold text-sm text-black-300" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="font-rubik text-xs text-gray-500" numberOfLines={1}>
          {item.address}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="font-rubik-bold text-primary-300 text-sm">
            ${item.price ? Number(item.price).toLocaleString() : 'N/A'}
          </Text>
          {(item.bedrooms || item.bathrooms) && (
            <Text className="font-rubik text-xs text-gray-400 ml-2">
              {item.bedrooms ? `${item.bedrooms}bd` : ''}{item.bedrooms && item.bathrooms ? ' • ' : ''}{item.bathrooms ? `${item.bathrooms}ba` : ''}
            </Text>
          )}
        </View>
      </View>
      <Image source={icons.rightArrow} className="w-4 h-4" tintColor="#666" />
    </TouchableOpacity>
  );

  if (displayProperties.length === 0) {
    return (
      <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <Text className="text-center text-gray-500 font-rubik-medium">
          No properties found nearby
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-black-300 font-rubik-bold text-lg">
          Nearby Properties
        </Text>
        {properties.length > maxItems && (
          <Text className="text-primary-300 font-rubik-medium text-sm">
            {properties.length - maxItems} more
          </Text>
        )}
      </View>
      <FlatList
        data={displayProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}