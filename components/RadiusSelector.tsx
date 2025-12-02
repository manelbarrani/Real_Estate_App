import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface RadiusSelectorProps {
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  className?: string;
}

const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
];

export default function RadiusSelector({ 
  selectedRadius, 
  onRadiusChange, 
  className = '' 
}: RadiusSelectorProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-black-300 font-rubik-medium text-sm mb-2">
        Search Radius
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-2">
          {RADIUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => onRadiusChange(option.value)}
              className={`px-4 py-2 rounded-full border ${
                selectedRadius === option.value
                  ? 'bg-primary-300 border-primary-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`font-rubik-medium text-sm ${
                  selectedRadius === option.value
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}