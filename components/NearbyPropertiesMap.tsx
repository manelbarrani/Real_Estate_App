import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface PropertyData {
  $id: string;
  name: string;
  price: string | number;
  address: string;
  geolocation?: any;
  image?: string;
  distance?: number;
}

interface NearbyPropertiesMapProps {
  properties: PropertyData[];
  userLatitude?: number;
  userLongitude?: number;
  onPropertyPress?: (propertyId: string) => void;
  height?: number;
}

const NearbyPropertiesMap: React.FC<NearbyPropertiesMapProps> = ({
  properties,
  userLatitude,
  userLongitude,
  onPropertyPress,
  height = 400,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const { markers, center } = useMemo(() => {
    const parseCoordinate = (value: any): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const resolveGeolocation = (geo: any): { lat: number | null; lng: number | null } => {
      if (!geo) return { lat: null, lng: null };

      if (typeof geo === 'string') {
        try {
          const parsed = JSON.parse(geo);
          return { 
            lat: parseCoordinate(parsed.lat ?? parsed.latitude),
            lng: parseCoordinate(parsed.lng ?? parsed.longitude)
          };
        } catch (err) {
          if (geo.includes(',')) {
            const [latPart, lngPart] = geo.split(',');
            return { 
              lat: parseCoordinate(latPart), 
              lng: parseCoordinate(lngPart) 
            };
          }
        }
      }

      if (typeof geo === 'object') {
        return {
          lat: parseCoordinate(geo.lat ?? geo.latitude),
          lng: parseCoordinate(geo.lng ?? geo.longitude),
        };
      }

      return { lat: null, lng: null };
    };

    const markers = properties
      .map((property) => {
        const geoCoords = resolveGeolocation(property.geolocation);
        if (geoCoords.lat === null || geoCoords.lng === null) return null;

        return {
          id: property.$id,
          name: property.name,
          price: property.price,
          address: property.address,
          lat: geoCoords.lat,
          lng: geoCoords.lng,
          image: property.image,
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

    // Determine center point
    let centerLat = 33.8869; // Default to Tunis
    let centerLng = 9.5375;

    if (userLatitude && userLongitude) {
      centerLat = userLatitude;
      centerLng = userLongitude;
    } else if (markers.length > 0) {
      // Calculate center from all markers
      const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
      const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
      centerLat = avgLat;
      centerLng = avgLng;
    }

    return { markers, center: [centerLat, centerLng] };
  }, [properties, userLatitude, userLongitude]);

  if (markers.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No properties with location data found</Text>
          <Text style={styles.emptySubtext}>
            Properties need latitude and longitude coordinates to appear on the map
          </Text>
        </View>
      </View>
    );
  }

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { 
        height: 100%; 
        margin: 0; 
        padding: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      }
      
      /* Popup styling */
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 3px 14px rgba(0,0,0,0.15);
      }
      .leaflet-popup-content {
        margin: 14px 16px;
        font-size: 14px;
        line-height: 1.4;
      }
      .property-popup {
        min-width: 180px;
      }
      .property-title {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 6px;
        font-size: 16px;
      }
      .property-price {
        color: #007AFF;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 15px;
      }
      .property-address {
        color: #6b7280;
        font-size: 13px;
        margin-bottom: 10px;
        line-height: 1.3;
      }
      .view-details {
        color: #007AFF;
        font-size: 13px;
        font-weight: 500;
        text-decoration: underline;
        cursor: pointer;
      }
      
      /* Custom markers */
      .property-marker {
        background-color: #007AFF;
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      }
      
      .user-marker {
        background-color: #34D399;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      /* Highlight selected marker */
      .selected-marker {
        background-color: #FF6B6B;
        transform: rotate(-45deg) scale(1.2);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const center = ${JSON.stringify(center)};
      const markers = ${JSON.stringify(markers)};
      const userLocation = ${JSON.stringify({ lat: userLatitude, lng: userLongitude })};
      
      const map = L.map('map').setView(center, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add user location marker if available
      if (userLocation.lat && userLocation.lng) {
        L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .setIcon(L.divIcon({
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }))
          .bindPopup('<div style="text-align: center; padding: 4px;"><strong>Your Location</strong></div>');
      }

      // Add property markers
      const propertyMarkers = {};
      markers.forEach((marker) => {
        const formattedPrice = typeof marker.price === 'number' 
          ? '$' + marker.price.toLocaleString() 
          : '$' + marker.price;
          
        const popupContent = \`
          <div class="property-popup">
            <div class="property-title">\${marker.name}</div>
            <div class="property-price">\${formattedPrice}</div>
            <div class="property-address">\${marker.address}</div>
            <div class="view-details" onclick="selectProperty('\${marker.id}')">View Details</div>
          </div>
        \`;

        const leafletMarker = L.marker([marker.lat, marker.lng])
          .addTo(map)
          .setIcon(L.divIcon({
            className: 'property-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 28]
          }))
          .bindPopup(popupContent);
          
        propertyMarkers[marker.id] = leafletMarker;
        
        leafletMarker.on('click', function() {
          highlightMarker(marker.id);
        });
      });

      function selectProperty(propertyId) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'propertySelected',
            propertyId: propertyId
          }));
        } catch(e) {
          console.error('Failed to send message to React Native:', e);
        }
      }

      function highlightMarker(propertyId) {
        // Reset all markers
        Object.values(propertyMarkers).forEach(marker => {
          const icon = marker.getIcon();
          icon.options.className = 'property-marker';
          marker.setIcon(icon);
        });
        
        // Highlight selected marker
        if (propertyMarkers[propertyId]) {
          const icon = propertyMarkers[propertyId].getIcon();
          icon.options.className = 'property-marker selected-marker';
          propertyMarkers[propertyId].setIcon(icon);
        }
      }

      // Handle messages from React Native
      window.addEventListener('message', function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'highlightProperty' && data.propertyId) {
            highlightMarker(data.propertyId);
          }
        } catch(e) {}
      });
    </script>
  </body>
  </html>`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'propertySelected' && data.propertyId) {
        setSelectedPropertyId(data.propertyId);
        onPropertyPress?.(data.propertyId);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NearbyPropertiesMap;