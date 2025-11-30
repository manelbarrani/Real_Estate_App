import icons from '@/constants/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebounce } from 'use-debounce';

const Search = () => {
  const router = useRouter();
  // const path = usePathname(); // not used currently
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState<string>(params.query?.toString() || '');
  const [debouncedValue] = useDebounce(query, 500);

  React.useEffect(() => {
    // Update route params only when debounced value changes
    router.setParams({ query: debouncedValue || undefined });
  }, [debouncedValue, router]);

  const handleChange = (text: string) => {
    setQuery(text);
  };

  return (
    <View className="flex flex-row items-center justify-between w-full px-4 rounded-xl bg-white border border-primary-100 mt-5 py-3.5 shadow-sm">
      <View className="flex-1 flex flex-row items-center justify-start">
        <Image source={icons.search} className="w-5 h-5" tintColor="#0061FF" />
        <TextInput
          value={query}
          onChangeText={handleChange}
          placeholder="Search by name, type or location..."
          placeholderTextColor="#999"
          className="text-sm font-rubik text-black-300 ml-3 flex-1"
          returnKeyType="search"
        />
      </View>
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')} className="ml-2">
          <Text className="text-black-200 font-rubik-bold text-lg">×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Search;