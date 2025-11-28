import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function LocationPicker({
  initial,
  onChange,
}: {
  initial?: { lat?: number; lng?: number };
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>(initial || {});

  const center = useMemo(() => {
    const lat = (coords?.lat ?? initial?.lat ?? 33.8869);
    const lng = (coords?.lng ?? initial?.lng ?? 9.5375);
    return [lat, lng];
  }, [coords, initial]);

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .marker { background-color:#0061FF;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);}
      .coords { position:absolute; bottom:10px; left:10px; background:#fff; padding:8px 10px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.15); font-family: sans-serif; font-size: 13px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="coords" class="coords">Tap the map to set location</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const center = ${JSON.stringify(center)};
      const map = L.map('map').setView(center, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

      let marker = L.marker(center).addTo(map);
      marker.setIcon(L.divIcon({ className: 'marker' }));

      function setCoords(latlng) {
        try {
          marker.setLatLng(latlng);
          document.getElementById('coords').innerText = 'Lat: ' + latlng.lat.toFixed(5) + ' | Lng: ' + latlng.lng.toFixed(5);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'coords', lat: latlng.lat, lng: latlng.lng }));
        } catch(e) {}
      }

      map.on('click', (e) => setCoords(e.latlng));
    </script>
  </body>
  </html>`;

  return (
    <View className="w-full rounded-xl overflow-hidden border border-primary-100" style={{ height: 260 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#f9f9f9' }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg?.type === 'coords') {
              const next = { lat: Number(msg.lat), lng: Number(msg.lng) };
              setCoords(next);
              onChange(next);
            }
          } catch(e) {}
        }}
      />
    </View>
  );
}
