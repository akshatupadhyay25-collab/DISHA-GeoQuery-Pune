import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [mapConfig, setMapConfig] = useState<any>(null);
  const { currentQuery, selectedDetection } = useAppStore();

  // Fetch map configuration from backend
  useEffect(() => {
    fetch('/api/map/config')
      .then(res => res.json())
      .then(config => {
        setMapConfig(config);
        console.log('🗺️ Map provider:', config.provider.toUpperCase());
      })
      .catch(err => {
        console.error('Failed to load map config, using default OSM:', err);
        setMapConfig({
          provider: 'osm',
          tile_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors'
        });
      });
  }, []);

  // Initialize map when config is loaded
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !mapConfig) return;

    // Create map centered on Pune
    const map = L.map(mapRef.current).setView([18.5204, 73.8567], 13);

    // Add tile layer based on configuration
    L.tileLayer(mapConfig.tile_url, {
      attribution: mapConfig.attribution,
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapConfig]);

  // Update markers when query results change
  useEffect(() => {
    if (!mapInstance.current || !currentQuery) return;

    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Add markers for detections
    currentQuery.detections.forEach((detection, index) => {
      const { bbox, confidence, class_name } = detection;
      const centerLat = (bbox.lat_min + bbox.lat_max) / 2;
      const centerLon = (bbox.lon_min + bbox.lon_max) / 2;

      // Draw bounding box
      const bounds: L.LatLngExpression[] = [
        [bbox.lat_min, bbox.lon_min],
        [bbox.lat_min, bbox.lon_max],
        [bbox.lat_max, bbox.lon_max],
        [bbox.lat_max, bbox.lon_min],
      ];

      const color = confidence > 0.8 ? '#176B52' : confidence > 0.6 ? '#D97706' : '#DC2626';

      L.polygon(bounds, {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map).bindPopup(`
        <div style="font-family: Inter, sans-serif;">
          <strong>${class_name}</strong><br/>
          Confidence: ${(confidence * 100).toFixed(1)}%<br/>
          <small>${centerLat.toFixed(5)}, ${centerLon.toFixed(5)}</small>
        </div>
      `);

      // Add marker at center
      L.marker([centerLat, centerLon]).addTo(map);
    });

    // Fit bounds to show all detections
    if (currentQuery.detections.length > 0) {
      const allCoords = currentQuery.detections.flatMap(d => [
        [d.bbox.lat_min, d.bbox.lon_min],
        [d.bbox.lat_max, d.bbox.lon_max]
      ]) as L.LatLngExpression[];
      
      map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }
  }, [currentQuery]);

  // Highlight selected detection
  useEffect(() => {
    if (!mapInstance.current || !selectedDetection) return;

    const map = mapInstance.current;
    const { bbox } = selectedDetection;
    const centerLat = (bbox.lat_min + bbox.lat_max) / 2;
    const centerLon = (bbox.lon_min + bbox.lon_max) / 2;

    map.flyTo([centerLat, centerLon], 16, { duration: 1 });
  }, [selectedDetection]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      {!mapConfig && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading map...</p>
          </div>
        </div>
      )}
      {mapConfig && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs text-text-secondary">
            Map Provider: <span className="font-semibold text-brand">{mapConfig.provider.toUpperCase()}</span>
          </p>
        </div>
      )}
    </div>
  );
}
