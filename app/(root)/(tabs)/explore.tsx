import { Card, PropertyDocument } from "@/components/Cards";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import PropertiesMap from '@/components/PropertiesMap';
import Search from "@/components/Search";
import icons from "@/constants/icons";
import { getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
//ScrollView
//FlatList (for list of items)


export default function Explore() {
  const params= useLocalSearchParams<{query?: string, filter?: string}>();

  const { data:properties, loading, refetch } = useAppwrite<PropertyDocument[], any>({
    fn: getProperties,
    params: {
      filter:  params.filter === "All" ? "" : params.filter ?? "",
      query: params.query ?? "",
      limit: 20,
    },
    skip: true,
  })
  const handlerCardPress = (id: string) => router.push({ pathname: "/propreties/[id]", params: { id } }); 
  useEffect(() => {
    // Parse advanced params
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
    const minBeds = params.minBeds ? Number(params.minBeds) : undefined;
    const maxBeds = params.maxBeds ? Number(params.maxBeds) : undefined;
    const bathrooms = params.bathrooms ? Number(params.bathrooms) : undefined;
    const facilities = params.facilities ? (params.facilities as string).split(',') : undefined;
    const sort = (params.sort as string) || undefined;

    refetch({
      filter:  params.filter === "All" ? "" : params.filter ?? "",
      query: params.query ?? "",
      limit: 50,
      minPrice,
      maxPrice,
      minBeds,
      maxBeds,
      bathrooms,
      facilities,
      sort,
    });
  }, [params.filter, params.query, params.minPrice, params.maxPrice, params.minBeds, params.bathrooms, params.facilities, params.sort]);

  const [showMap, setShowMap] = React.useState(false);

  return (
    <SafeAreaView className="bg-white h-full">
     
      <FlatList
        data= {properties} 
          renderItem={({item}) =><Card item={item as unknown as PropertyDocument} onPress={()=> handlerCardPress(item.$id)}/>}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          contentContainerClassName="pb-32"
          columnWrapperClassName="flex gap-5 px-5"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" className="text-primary-300 mt-5" />
            ) : (
              <NoResults />
            )
          }
          ListHeaderComponent={
            <View className="px-5">
                <View className="flex flex-row items-center justify-between mt-5">
                    <TouchableOpacity onPress={() => router.back()} className="flex flrx-row 
                    bg-primary-200 rounded-full size-11 items-center justify-center"> 
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <Text className="text-center font-rubik-medium text-black-300">Search for your Ideal Home</Text>
                    <Image source={icons.bell} className="w-6 h-6" />

                </View>
                <Search />

                <View className="mt-5">
                    <Filters/>
                    <View className="flex-row items-center justify-between mt-4">
                      <Text className="text-xl font-rubik-bold text-black-300">
                        {properties?.length || 0} Properties
                      </Text>
                      <TouchableOpacity onPress={() => setShowMap(s => !s)} className="flex-row items-center px-4 py-2.5 rounded-full bg-primary-300 shadow-sm">
                        <Image source={showMap ? icons.home : icons.location} className="w-4 h-4 mr-2" tintColor="white" />
                        <Text className="text-white font-rubik-medium text-sm">{showMap ? 'List View' : 'Map View'}</Text>
                      </TouchableOpacity>
                    </View>
                    {showMap && <View className="mt-4"><PropertiesMap properties={properties || []} /></View>}
                </View>
            </View>
          }  
      />   
    </SafeAreaView>
  );
}
