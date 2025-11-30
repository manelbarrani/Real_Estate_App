import { categories, facilities as facilityOptions } from '@/constants/data';
import icons from '@/constants/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SortKey = 'newest' | 'price_high' | 'price_low' | 'rating';

type FiltersProps = {
  initial?: {
    filter?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    bathrooms?: number;
    facilities?: string[];
    sort?: SortKey;
  };
  onApply?: (params: {
    filter?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    bathrooms?: number;
    facilities?: string[];
    sort?: SortKey;
  }) => void;
  showCategories?: boolean;
};

const Filters = ({ initial, onApply, showCategories = true }: FiltersProps) => {
  const params = useLocalSearchParams();
  const filter = typeof params.filter === 'string' ? params.filter : undefined;
  const router = useRouter();
  const safeSetParams = (params: Record<string, any>) => {
    try {
      // Avoid crashing if navigation context is not available
      (router as any)?.setParams?.(params);
    } catch (e) {
      // noop: filters still update local UI even if params cannot be set
      console.warn('Filters: setParams failed (no nav context)', e);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>(initial?.filter || filter || 'All');
  const [expanded, setExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState<string>(
    initial?.minPrice !== undefined ? String(initial.minPrice) : (params.minPrice as string) || ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initial?.maxPrice !== undefined ? String(initial.maxPrice) : (params.maxPrice as string) || ''
  );
  const [minBeds, setMinBeds] = useState<string>(
    initial?.minBeds !== undefined ? String(initial.minBeds) : (params.minBeds as string) || ''
  );
  const [bathrooms, setBathrooms] = useState<string>(
    initial?.bathrooms !== undefined ? String(initial.bathrooms) : (params.bathrooms as string) || ''
  );
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    initial?.facilities ?? (params.facilities ? (params.facilities as string).split(',') : [])
  );
  const [sort, setSort] = useState<SortKey>((initial?.sort || (params.sort as SortKey)) || 'newest');

  // Keep local state in sync if `initial` changes
  useEffect(() => {
    if (!initial) return;
    setSelectedCategory(initial.filter || 'All');
    setMinPrice(initial.minPrice !== undefined ? String(initial.minPrice) : '');
    setMaxPrice(initial.maxPrice !== undefined ? String(initial.maxPrice) : '');
    setMinBeds(initial.minBeds !== undefined ? String(initial.minBeds) : '');
    setBathrooms(initial.bathrooms !== undefined ? String(initial.bathrooms) : '');
    setSelectedFacilities(initial.facilities || []);
    setSort(initial.sort || 'newest');
  }, [initial]);

  const handleCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory('All');
      safeSetParams({ filter: 'All' });
      return;
    }
    setSelectedCategory(category);
    safeSetParams({ filter: category });
  };

  const parsed = useMemo(() => ({
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minBeds: minBeds ? Number(minBeds) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    facilities: selectedFacilities,
    sort,
  }), [minPrice, maxPrice, minBeds, bathrooms, selectedFacilities, sort]);

  const applyAdvancedFilters = () => {
    if (onApply) {
      onApply({
        filter: selectedCategory === 'All' ? undefined : selectedCategory,
        ...parsed,
      });
    } else {
      const facilitiesParam = parsed.facilities && parsed.facilities.length > 0 ? parsed.facilities.join(',') : undefined;
      safeSetParams({
        filter: selectedCategory || 'All',
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        minBeds: parsed.minBeds,
        bathrooms: parsed.bathrooms,
        facilities: facilitiesParam,
        sort: parsed.sort,
      });
    }
    setExpanded(false);
  };

  const toggleFacility = (title: string) => {
    setSelectedFacilities((prev) => {
      if (prev.includes(title)) return prev.filter((p) => p !== title);
      return [...prev, title];
    });
  };

  return (
    <>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 mb-2"
    >
      {showCategories && categories.map((item) => (
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

      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        className="flex flex-row items-center mr-4 px-4 py-2 rounded-full bg-primary-300 shadow-sm"
      >
        <Image source={icons.filter} className="w-4 h-4 mr-1.5" tintColor="white" />
        <Text className="text-sm text-white font-rubik-bold">Filters</Text>
      </TouchableOpacity>
    </ScrollView>
    {expanded && (
      <View className="px-4 py-4 bg-white border-t border-primary-100 rounded-b-lg shadow-sm">
        <Text className="font-rubik-bold text-black-300 mb-2 text-sm">Price Range</Text>
        <View className="flex flex-row gap-3 mb-4">
          <TextInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min price"
            keyboardType="numeric"
            placeholderTextColor="#999"
            className="flex-1 border border-primary-100 bg-white px-4 py-3 rounded-lg font-rubik"
          />
          <TextInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max price"
            keyboardType="numeric"
            placeholderTextColor="#999"
            className="flex-1 border border-primary-100 bg-white px-4 py-3 rounded-lg font-rubik"
          />
        </View>

        <Text className="font-rubik-bold text-black-300 mb-2 text-sm">Bedrooms & Bathrooms</Text>
        <View className="flex flex-row gap-3 mb-4">
          <TextInput
            value={minBeds}
            onChangeText={setMinBeds}
            placeholder="Min beds"
            keyboardType="numeric"
            placeholderTextColor="#999"
            className="flex-1 border border-primary-100 bg-white px-4 py-3 rounded-lg font-rubik"
          />
          <TextInput
            value={bathrooms}
            onChangeText={setBathrooms}
            placeholder="Bathrooms"
            keyboardType="numeric"
            placeholderTextColor="#999"
            className="flex-1 border border-primary-100 bg-white px-4 py-3 rounded-lg font-rubik"
          />
        </View>

        <View className="mb-4">
          <Text className="font-rubik-bold text-black-300 mb-2 text-sm">Facilities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {facilityOptions.map((f) => (
              <TouchableOpacity
                key={f.title}
                onPress={() => toggleFacility(f.title)}
                className={`px-3 py-2 mr-3 rounded-full ${selectedFacilities.includes(f.title) ? 'bg-primary-300' : 'bg-black-100 border border-primary-200'}`}
              >
                <Text className={`${selectedFacilities.includes(f.title) ? 'text-white' : 'text-black-300'}`}>{f.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-4">
          <Text className="font-rubik-bold text-black-300 mb-2 text-sm">Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex flex-row gap-2">
              {(['newest','price_high','price_low','rating'] as SortKey[]).map((s) => {
                const labels: Record<string, string> = {
                  newest: 'Newest',
                  price_high: 'Price: High',
                  price_low: 'Price: Low',
                  rating: 'Rating'
                };
                return (
                  <TouchableOpacity key={s} onPress={() => setSort(s as SortKey)} className={`px-4 py-2 rounded-full ${sort===s ? 'bg-primary-300' : 'bg-black-100 border border-primary-200'}`}>
                    <Text className={`text-sm font-rubik ${sort===s? 'text-white' : 'text-black-300'}`}>{labels[s]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="flex flex-row justify-end gap-3 pt-2">
          <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); setMinBeds(''); setBathrooms(''); setSelectedFacilities([]); setSort('newest'); safeSetParams({ minPrice: undefined, maxPrice: undefined, minBeds: undefined, bathrooms: undefined, facilities: undefined, sort: undefined }); setExpanded(false); }} className="px-5 py-3 rounded-lg bg-white border border-primary-200"> 
            <Text className="font-rubik-medium text-black-300">Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyAdvancedFilters} className="px-6 py-3 rounded-lg bg-primary-300 shadow-sm">
            <Text className="text-white font-rubik-bold">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
    </>
  );
};

export default Filters;