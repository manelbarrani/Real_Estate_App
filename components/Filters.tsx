import { categories } from '@/constants/data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

const Filters = () => {
  const params = useLocalSearchParams();
  const filter = typeof params.filter === 'string' ? params.filter : undefined;
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(filter || 'All');

  const handleCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory('All');
      router.setParams({ filter: 'All' });
      return;
    }
    setSelectedCategory(category);
    router.setParams({ filter: category });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 mb-2"
    >
      {categories.map((item) => (
        <TouchableOpacity
          key={item.category}
            onPress={() => handleCategory(item.category)}
            className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${selectedCategory === item.category ? 'bg-primary-300' : 'bg-black-100 border border-primary-200'}`}
        >
          <Text
            className={`text-sm ${selectedCategory === item.category ? 'text-white font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'}`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Filters;