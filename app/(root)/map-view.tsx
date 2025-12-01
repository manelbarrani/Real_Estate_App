import LocationStatus from '@/components/LocationStatus';
import NearbyPropertiesMap from '@/components/NearbyPropertiesMap';

import PropertyQuickList from '@/components/PropertyQuickList';
import RadiusSelector from '@/components/RadiusSelector';

import { useLocation } from '@/hooks/useLocation';
import { useNearbyProperties } from '@/hooks/useNearbyProperties';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const MapView = () => {
  const params = useLocalSearchParams();
  const [radiusKm, setRadiusKm] = useState(10);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  // Debug radius changes
  const handleRadiusChange = (newRadius: number) => {
    console.log(`📏 Radius changing from ${radiusKm}km to ${newRadius}km`);
    setRadiusKm(newRadius);
  };
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  
  const { 
    nearbyProperties, 
    loading: propertiesLoading, 
    error,
    refreshNearbyProperties 
  } = useNearbyProperties(
    location?.latitude, 
    location?.longitude, 
    radiusKm
  );

  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/propreties/[id]',
      params: { id: propertyId }
    });
  };

  const handleRefresh = async () => {
    await getCurrentLocation();
    await refreshNearbyProperties();
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Map View</Text>
        
        <TouchableOpacity 
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={locationLoading || propertiesLoading}
        >
          {locationLoading || propertiesLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="refresh" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Status and Filters */}
      <View style={styles.filtersContainer}>
        <LocationStatus
          userLocation={location ? {
            coords: {
              latitude: location.latitude,
              longitude: location.longitude,
              altitude: null,
              accuracy: location.accuracy || 0,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          } : null}
          locationLoading={locationLoading}
          locationError={error}
          nearbyCount={nearbyProperties.length}
        />
        
        <RadiusSelector
          selectedRadius={radiusKm}
          onRadiusChange={handleRadiusChange}
        />
        
        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons 
              name="map" 
              size={16} 
              color={viewMode === 'map' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'map' && styles.toggleButtonTextActive
            ]}>
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={16} 
              color={viewMode === 'list' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'list' && styles.toggleButtonTextActive
            ]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>Failed to load properties</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'map' ? (
          <NearbyPropertiesMap
            properties={nearbyProperties}
            userLatitude={location?.latitude}
            userLongitude={location?.longitude}
            onPropertyPress={handlePropertyPress}
            height={400}
          />
        ) : (
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            <PropertyQuickList
              properties={nearbyProperties}
              onPropertyPress={handlePropertyPress}
              maxItems={20}
            />
          </ScrollView>
        )}
      </View>

      {/* Properties Count */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {propertiesLoading ? 'Loading properties...' : 
           `Showing ${nearbyProperties.length} ${nearbyProperties.length === 1 ? 'property' : 'properties'}`}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    margin: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default MapView;