import { PropertyDocument } from '@/components/Cards';
import { getProperties } from '@/lib/appwrite';
import { useEffect, useState } from 'react';

export interface PropertyLocation extends PropertyDocument {
  distance?: number;
}

interface UseNearbyPropertiesReturn {
  nearbyProperties: PropertyLocation[];
  loading: boolean;
  error: string | null;
  refreshNearbyProperties: () => Promise<void>;
}

const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const parseGeolocation = (geo: any): { lat: number, lng: number } | null => {
  if (!geo) return null;
  
  try {
    if (typeof geo === 'string') {
      const parsed = JSON.parse(geo);
      return { lat: parsed.lat, lng: parsed.lng };
    }
    if (typeof geo === 'object') {
      return { lat: geo.lat, lng: geo.lng };
    }
  } catch (err) {
    console.error('Error parsing geolocation:', err);
  }
  
  return null;
};

export const useNearbyProperties = (
  userLatitude?: number,
  userLongitude?: number,
  radiusKm: number = 10
): UseNearbyPropertiesReturn => {
  const [nearbyProperties, setNearbyProperties] = useState<PropertyLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyProperties = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all properties
      const allProperties = await getProperties({
        filter: "All",
        query: "",
        limit: 100
      });

      if (!userLatitude || !userLongitude) {
        // If no user location, return all properties without distance calculation
        setNearbyProperties(allProperties.map(p => ({
          ...p,
          distance: undefined
        })));
        return;
      }

      // Filter properties within radius and calculate distances
      const propertiesWithDistance: PropertyLocation[] = [];
      
      for (const property of allProperties) {
        const geoCoords = parseGeolocation(property.geolocation || '');
        if (!geoCoords) continue;

        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          geoCoords.lat,
          geoCoords.lng
        );

        const isIncluded = distance <= radiusKm;
        console.log(`🏠 ${property.name}: ${distance.toFixed(2)}km (${isIncluded ? 'INCLUDED' : 'EXCLUDED'} for ${radiusKm}km radius)`);
        
        if (isIncluded) {
          propertiesWithDistance.push({
            ...property,
            distance
          });
        }
      }
      
      propertiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      console.log(`🎯 Found ${propertiesWithDistance.length} properties within ${radiusKm}km radius`);
      setNearbyProperties(propertiesWithDistance);
    } catch (err) {
      setError('Error fetching nearby properties');
      console.error('Nearby properties error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshNearbyProperties = async (): Promise<void> => {
    await fetchNearbyProperties();
  };

  useEffect(() => {
    console.log(`📍 useNearbyProperties: Fetching properties with radius ${radiusKm}km`, {
      userLatitude,
      userLongitude,
      radiusKm
    });
    fetchNearbyProperties();
  }, [userLatitude, userLongitude, radiusKm]);

  return {
    nearbyProperties,
    loading,
    error,
    refreshNearbyProperties,
  };
};