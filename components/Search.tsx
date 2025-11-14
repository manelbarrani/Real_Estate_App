import icons from '@/constants/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';
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
    <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
      <View className="flex-1 flex flex-row items-center justify-start">
        <Image source={icons.search} className="size-5" />
        <TextInput
          value={query}
          onChangeText={handleChange}
          placeholder="Search for location"
          placeholderTextColor="#748C94"
          className="text-sm font-rubik text-black-300 ml-2 flex-1"
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity>
        <Image source={icons.filter} className="size-5" />
      </TouchableOpacity>
    </View>
  );
};

export default Search;