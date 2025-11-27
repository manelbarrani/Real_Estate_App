import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  properties: any[];
}

// This component renders an OpenStreetMap + Leaflet map inside a WebView.
// It avoids native map SDKs and does not require any billing/API keys.
const PropertiesMap = ({ properties }: Props) => {
  const markers = useMemo(() => {
    if (!properties || properties.length === 0) return [];

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
          const lat = parseCoordinate(parsed.lat ?? parsed.latitude);
          const lng = parseCoordinate(parsed.lng ?? parsed.longitude);
          return { lat, lng };
        } catch (err) {
          if (geo.includes(',')) {
            const [latPart, lngPart] = geo.split(',');
            return { lat: parseCoordinate(latPart), lng: parseCoordinate(lngPart) };
          }
        }
      }

      if (typeof geo === 'object') {
        const latCandidate = geo.lat ?? geo.latitude;
        const lngCandidate = geo.lng ?? geo.longitude;
        return {
          lat: parseCoordinate(latCandidate),
          lng: parseCoordinate(lngCandidate),
        };
      }

      return { lat: null, lng: null };
    };

    return properties
      .map((p) => {
        const geo = resolveGeolocation(p?.geolocation);

        let lat = geo.lat;
        let lng = geo.lng;

        if (lat === null || lng === null) {
          const fallbackLat = parseCoordinate(p?.latitude);
          const fallbackLng = parseCoordinate(p?.longitude);
          lat = lat ?? fallbackLat;
          lng = lng ?? fallbackLng;
        }

        return {
          id: p.$id,
          name: p.name,
          address: p.address,
          price: p.price,
          lat,
          lng,
        };
      })
      .filter((m) => m.lat !== null && m.lng !== null) as Array<{
        id: string;
        name: string;
        address: string;
        price: number;
        lat: number;
        lng: number;
      }>;
  }, [properties]);

  const center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [33.8869, 9.5375];

  if (markers.length === 0) {
    return (
      <View className="w-full bg-black-100 border border-primary-100 rounded-xl p-8 items-center justify-center" style={{ height: 300 }}>
        <Text className="text-black-300 font-rubik-medium text-center">
          No properties with location data found
        </Text>
        <Text className="text-black-200 font-rubik text-sm text-center mt-2">
          Properties need latitude and longitude coordinates to appear on the map
        </Text>
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 3px 14px rgba(0,0,0,0.15);
      }
      .leaflet-popup-content {
        margin: 12px 14px;
        font-size: 14px;
        line-height: 1.4;
      }
      .property-popup {
        min-width: 160px;
      }
      .property-title {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
        font-size: 15px;
      }
      .property-price {
        color: #0061FF;
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 14px;
      }
      .property-address {
        color: #6b7280;
        font-size: 13px;
        margin-bottom: 8px;
      }
      .view-details {
        color: #0061FF;
        font-size: 13px;
        font-weight: 500;
        text-decoration: underline;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const markers = ${JSON.stringify(markers)};
      const center = ${JSON.stringify(center)};
      
      const map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      }).setView(center, 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      // Custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color:#0061FF;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      markers.forEach(m => {
        try {
          const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);
          
          const popupContent = \`
            <div class="property-popup">
              <div class="property-title">\${m.name || 'Property'}</div>
              <div class="property-price">$\${(m.price || 0).toLocaleString()}</div>
              <div class="property-address">\${m.address || 'Address not available'}</div>
              <div class="view-details" onclick="viewProperty('\${m.id}')">View Details →</div>
            </div>
          \`;
          
          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
          });
          
        } catch(e) { 
          console.error('Marker error:', e); 
        }
      });

      // Fit bounds to show all markers
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }

      function viewProperty(id) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker', id: id }));
        } catch(e) {
          console.error('postMessage error:', e);
        }
      }
    </script>
  </body>
  </html>`;

  return (
    <View className="w-full rounded-xl overflow-hidden shadow-md border border-primary-100" style={{ height: 320 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#f0f0f0' }}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        automaticallyAdjustContentInsets
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg?.type === 'marker' && msg?.id) {
              router.push({ pathname: '/propreties/[id]', params: { id: msg.id } } as any);
            }
          } catch (e) {
            console.error('Message parsing error:', e);
          }
        }}
      />
    </View>
  );
};

export default PropertiesMap;
