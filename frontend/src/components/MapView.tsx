import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, Layers3, Loader2, Minus, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { Detection } from '../types';

interface MapViewProps {
  focusLocation?: { lat: number; lon: number } | null;
}

interface MapConfig {
  provider: string;
  tile_url: string;
  attribution: string;
}

const DEFAULT_MAP_CONFIG: MapConfig = {
  provider: 'osm',
  tile_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
};

const PUNE_CENTER: L.LatLngExpression = [18.5204, 73.8567];

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
}

function getDetectionBounds(detection: Detection): L.LatLngBounds | null {
  const bbox = detection.bbox;
  if (
    bbox &&
    [bbox.lat_min, bbox.lat_max, bbox.lon_min, bbox.lon_max].every(
      (coordinate: unknown) => typeof coordinate === 'number' && Number.isFinite(coordinate),
    )
  ) {
    const south = bbox.lat_min as number;
    const north = bbox.lat_max as number;
    const west = bbox.lon_min as number;
    const east = bbox.lon_max as number;
    if (
      isValidCoordinate(south, west) &&
      isValidCoordinate(north, east) &&
      south <= north &&
      west <= east
    ) {
      return L.latLngBounds([south, west], [north, east]);
    }
  }

  const coordinates = detection.coordinates;
  const latitude = typeof detection.center_lat === 'number'
    ? detection.center_lat
    : Array.isArray(coordinates) && typeof coordinates[1] === 'number'
      ? coordinates[1]
      : null;
  const longitude = typeof detection.center_lon === 'number'
    ? detection.center_lon
    : Array.isArray(coordinates) && typeof coordinates[0] === 'number'
      ? coordinates[0]
      : null;

  if (latitude !== null && longitude !== null && isValidCoordinate(latitude, longitude)) {
    return L.latLngBounds([latitude, longitude], [latitude, longitude]);
  }

  return null;
}

function getDetectionLabel(detection: Detection) {
  return detection.name || detection.detection_class || detection.type || 'Search result';
}

function createResultIcon() {
  return L.divIcon({
    className: 'disha-result-icon',
    html: '<span class="disha-result-marker" aria-hidden="true"></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}

export function MapView({ focusLocation = null }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const resultLayer = useRef<L.LayerGroup | null>(null);
  const locationLayer = useRef<L.LayerGroup | null>(null);
  const { currentQuery, selectedDetection, setSelectedDetection } = useAppStore();
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [mapMessage, setMapMessage] = useState('');
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.getMapConfig()
      .then((config: MapConfig) => {
        if (
          !config ||
          typeof config.tile_url !== 'string' ||
          !config.tile_url ||
          typeof config.attribution !== 'string' ||
          !config.attribution
        ) {
          throw new Error('The map service returned an invalid tile configuration.');
        }
        if (!cancelled) {
          setMapConfig({
            provider: typeof config.provider === 'string' ? config.provider : 'map',
            tile_url: config.tile_url,
            attribution: typeof config.attribution === 'string' ? config.attribution : '',
          });
          setMapMessage('');
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load map configuration; using the OpenStreetMap fallback.', error);
        if (!cancelled) {
          setMapConfig(DEFAULT_MAP_CONFIG);
          setMapMessage('Map configuration is unavailable. Showing OpenStreetMap instead.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = mapRef.current;
    if (!element || !mapConfig || mapInstance.current) return;

    const map = L.map(element, {
      zoomControl: false,
      attributionControl: true,
    }).setView(PUNE_CENTER, 13);
    const results = L.layerGroup().addTo(map);
    const userLocation = L.layerGroup().addTo(map);
    const tiles = L.tileLayer(mapConfig.tile_url, {
      attribution: mapConfig.attribution,
      maxZoom: 19,
    });

    tiles.on('tileerror', () => setTilesUnavailable(true));
    tiles.addTo(map);
    mapInstance.current = map;
    resultLayer.current = results;
    locationLayer.current = userLocation;
    setMapReady(true);

    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resizeObserver.observe(element);
    const resizeTimer = window.setTimeout(() => map.invalidateSize({ pan: false }), 0);

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      tiles.off();
      map.remove();
      mapInstance.current = null;
      resultLayer.current = null;
      locationLayer.current = null;
    };
  }, [mapConfig]);

  useEffect(() => {
    const map = mapInstance.current;
    const resultsLayer = resultLayer.current;
    if (!map || !resultsLayer) return;

    resultsLayer.clearLayers();
    const resultBounds: L.LatLngBounds[] = [];
    const detections = currentQuery?.results?.detections ?? [];

    detections.forEach((detection) => {
      const bounds = getDetectionBounds(detection);
      if (!bounds) return;

      const center = bounds.getCenter();
      const confidence = detection.confidence;
      const label = getDetectionLabel(detection);
      const isArea = bounds.getSouth() !== bounds.getNorth() || bounds.getWest() !== bounds.getEast();

      if (isArea) {
        L.rectangle(bounds, {
          className: 'disha-result-footprint',
          color: 'hsl(var(--primary))',
          fillColor: 'hsl(var(--primary))',
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(resultsLayer);
      }

      const popup = document.createElement('div');
      popup.className = 'disha-map-popup';
      const title = document.createElement('strong');
      title.textContent = label;
      popup.append(title);

      if (typeof confidence === 'number') {
        const confidenceText = document.createElement('span');
        confidenceText.textContent = `Confidence: ${(confidence * 100).toFixed(1)}%`;
        popup.append(confidenceText);
      }

      const coordinates = document.createElement('small');
      coordinates.textContent = `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;
      popup.append(coordinates);

      L.marker(center, { icon: createResultIcon() })
        .bindPopup(popup)
        .on('click', () => setSelectedDetection(detection))
        .addTo(resultsLayer);
      resultBounds.push(bounds);
    });

    if (resultBounds.length > 0) {
      const bounds = resultBounds.reduce((combined, current) => combined.extend(current));
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16 });
    }
  }, [currentQuery, mapReady, setSelectedDetection]);

  useEffect(() => {
    const map = mapInstance.current;
    const userLayer = locationLayer.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();
    if (!focusLocation || !isValidCoordinate(focusLocation.lat, focusLocation.lon)) return;

    const marker = L.circleMarker([focusLocation.lat, focusLocation.lon], {
      radius: 8,
      color: 'hsl(var(--card))',
      weight: 3,
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 1,
      className: 'disha-user-location-marker',
    });
    marker.bindPopup('Your current location');
    marker.addTo(userLayer);
    map.flyTo([focusLocation.lat, focusLocation.lon], 15, { duration: 0.8 });
  }, [focusLocation, mapReady]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedDetection) return;

    const bounds = getDetectionBounds(selectedDetection);
    if (bounds) {
      map.flyToBounds(bounds, { padding: [56, 56], maxZoom: 16, duration: 0.8 });
    }
  }, [selectedDetection]);

  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();

  return (
    <div className="relative h-full min-h-[340px] w-full flex-1 overflow-hidden bg-muted">
      <div ref={mapRef} className="disha-map-canvas absolute inset-0 h-full min-h-[340px] w-full" />

      {!mapConfig && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-card/90">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading map configuration...
          </div>
        </div>
      )}

      {mapConfig && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 z-[450] flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-md backdrop-blur sm:left-4 sm:top-4">
            <Layers3 className="h-3.5 w-3.5 text-primary" />
            {mapConfig.provider.toUpperCase()}
          </div>

          <div className="absolute right-3 top-3 z-[450] flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 shadow-md backdrop-blur sm:right-4 sm:top-4">
            <button
              type="button"
              onClick={zoomIn}
              disabled={!mapReady}
              aria-label="Zoom in"
              title="Zoom in"
              className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-px bg-border" />
            <button
              type="button"
              onClick={zoomOut}
              disabled={!mapReady}
              aria-label="Zoom out"
              title="Zoom out"
              className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-7 left-3 z-[450] max-w-[calc(100%-6rem)] rounded-xl border border-border bg-card/95 p-3 text-xs text-foreground shadow-md backdrop-blur sm:bottom-8 sm:left-4">
            <p className="mb-2 font-semibold">Map legend</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-muted-foreground">
              {currentQuery?.results?.detections?.some((detection) => getDetectionBounds(detection)) && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="disha-legend-marker" />
                    Search result
                  </span>
                  {currentQuery.results.detections.some((detection) => {
                    const bounds = getDetectionBounds(detection);
                    return bounds && (bounds.getSouth() !== bounds.getNorth() || bounds.getWest() !== bounds.getEast());
                  }) && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="disha-legend-footprint" />
                      Result bounding box
                    </span>
                  )}
                </>
              )}
              {focusLocation && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="disha-legend-location" />
                  Your location
                </span>
              )}
              {!currentQuery?.results?.detections?.some((detection) => getDetectionBounds(detection)) && !focusLocation && (
                <span>Result markers appear when the service returns valid coordinates.</span>
              )}
            </div>
          </div>

          {(mapMessage || tilesUnavailable) && (
            <div
              role="status"
              className="absolute left-3 top-14 z-[450] flex max-w-[calc(100%-5.5rem)] items-start gap-2 rounded-xl border border-status-warning/30 bg-card/95 px-3 py-2 text-xs text-foreground shadow-md backdrop-blur sm:left-4 sm:top-16 sm:max-w-[calc(100%-6.5rem)]"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" />
              <span>{tilesUnavailable ? 'Map tiles could not be loaded. Check your connection or map provider configuration.' : mapMessage}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
