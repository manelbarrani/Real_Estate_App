import { categories, facilities as facilityOptions } from '@/constants/data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Animated, Dimensions, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SortKey = 'newest' | 'price_high' | 'price_low' | 'rating';

export interface FiltersRef {
  openSidebar: () => void;
}

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

const Filters = forwardRef<FiltersRef, FiltersProps>(({ initial, onApply, showCategories = true }, ref) => {
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
  const [slideAnim] = useState(new Animated.Value(-Dimensions.get('window').width * 0.8));

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

  const openSidebar = () => {
    setExpanded(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setExpanded(false));
  };

  useImperativeHandle(ref, () => ({
    openSidebar,
  }));

  return (
    <>
    {showCategories && (
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
    )}

    <Modal
      visible={expanded}
      transparent
      animationType="none"
      onRequestClose={closeSidebar}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View 
          style={{ 
            transform: [{ translateX: slideAnim }],
            width: Dimensions.get('window').width * 0.85,
            height: '100%',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#191D31' }}>Filtres</Text>
              <TouchableOpacity onPress={closeSidebar} style={{ padding: 8 }}>
                <Text style={{ fontSize: 28, color: '#191D31' }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
          >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#191D31', marginBottom: 12 }}>Prix</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#666' }}>${minPrice || '0'}</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>${maxPrice || '10000'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              value={minPrice}
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, '');
                setMinPrice(num);
              }}
              placeholder="Min"
              keyboardType="numeric"
              placeholderTextColor="#999"
              style={{ 
                flex: 1, 
                borderWidth: 1, 
                borderColor: '#E5E7EB', 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8, 
                textAlign: 'center',
                fontSize: 14
              }}
            />
            <Text style={{ alignSelf: 'center', color: '#191D31', fontWeight: '500' }}>-</Text>
            <TextInput
              value={maxPrice}
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, '');
                setMaxPrice(num);
              }}
              placeholder="Max"
              keyboardType="numeric"
              placeholderTextColor="#999"
              style={{ 
                flex: 1, 
                borderWidth: 1, 
                borderColor: '#E5E7EB', 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8, 
                textAlign: 'center',
                fontSize: 14
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#191D31', marginBottom: 12 }}>Chambres & Salles de bain</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              value={minBeds}
              onChangeText={setMinBeds}
              placeholder="Min chambres"
              keyboardType="numeric"
              placeholderTextColor="#999"
              style={{ 
                flex: 1, 
                borderWidth: 1, 
                borderColor: '#E5E7EB', 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8,
                fontSize: 14
              }}
            />
            <TextInput
              value={bathrooms}
              onChangeText={setBathrooms}
              placeholder="Salles de bain"
              keyboardType="numeric"
              placeholderTextColor="#999"
              style={{ 
                flex: 1, 
                borderWidth: 1, 
                borderColor: '#E5E7EB', 
                backgroundColor: 'white', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8,
                fontSize: 14
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#191D31', marginBottom: 12 }}>Équipements</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {facilityOptions.map((f) => (
              <TouchableOpacity
                key={f.title}
                onPress={() => toggleFacility(f.title)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedFacilities.includes(f.title) ? '#0061FF' : '#F5F5F5',
                  borderWidth: selectedFacilities.includes(f.title) ? 0 : 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Text style={{ 
                  color: selectedFacilities.includes(f.title) ? 'white' : '#191D31',
                  fontSize: 13
                }}>{f.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

          </ScrollView>

          {/* Fixed Bottom Buttons */}
          <View style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            borderTopWidth: 1, 
            borderTopColor: '#E5E7EB',
            backgroundColor: 'white',
            flexDirection: 'row',
            gap: 12
          }}>
              <TouchableOpacity 
                onPress={() => { 
                  setMinPrice(''); 
                  setMaxPrice(''); 
                  setMinBeds(''); 
                  setBathrooms(''); 
                  setSelectedFacilities([]); 
                  setSort('newest'); 
                  safeSetParams({ 
                    minPrice: undefined, 
                    maxPrice: undefined, 
                    minBeds: undefined, 
                    bathrooms: undefined, 
                    facilities: undefined, 
                    sort: undefined 
                  }); 
                  closeSidebar(); 
                }} 
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  borderWidth: 2,
                  borderColor: '#0061FF',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              > 
                <Text style={{ fontWeight: '700', color: '#0061FF', fontSize: 15 }}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => { 
                  applyAdvancedFilters(); 
                  closeSidebar(); 
                }} 
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: '#0061FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#0061FF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Appliquer</Text>
              </TouchableOpacity>
            </View>
        </Animated.View>
        
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={closeSidebar}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
      </View>
    </Modal>
    </>
  );
});

Filters.displayName = 'Filters';

export default Filters;