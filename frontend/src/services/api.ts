import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface NaturalLanguageQueryResponse {
  query_id: string;
  original_query: string;
  parsed_query: Record<string, unknown>;
  results: {
    total_found: number;
    detections: Array<{
      id?: string;
      tile_id?: string;
      detection_class?: string;
      name?: string;
      type?: string;
      confidence?: number;
      center_lat?: number;
      center_lon?: number;
      bbox?: {
        lat_min: number;
        lat_max: number;
        lon_min: number;
        lon_max: number;
      };
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  geojson?: Record<string, unknown>;
  insights?: string;
  processing_time_ms: number;
  timestamp: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Search & Query
  query: async (query: string): Promise<NaturalLanguageQueryResponse> => {
    const response = await apiClient.post<NaturalLanguageQueryResponse>('/api/query', { query });
    return response.data;
  },

  search: async (params: {
    query: string;
    latitude: number;
    longitude: number;
    radius: number;
    useAI?: boolean;
  }) => {
    const response = await apiClient.post('/api/search', params);
    return response.data;
  },

  reverseGeocode: async (latitude: number, longitude: number) => {
    const response = await apiClient.post('/api/search/reverse', { latitude, longitude });
    return response.data;
  },

  // Map
  getMapConfig: async () => {
    const response = await apiClient.get('/api/map/config', { timeout: 5000 });
    return response.data;
  },

  // Analysis
  changeDetection: async (params: {
    bbox: [number, number, number, number];
    startDate: string;
    endDate: string;
  }) => {
    const response = await apiClient.post('/api/analysis/change-detection', params);
    return response.data;
  },

  vegetationAnalysis: async (params: {
    bbox: [number, number, number, number];
    date: string;
  }) => {
    const response = await apiClient.post('/api/analysis/vegetation', params);
    return response.data;
  },

  urbanGrowthAnalysis: async (params: {
    bbox: [number, number, number, number];
    years: number[];
  }) => {
    const response = await apiClient.post('/api/analysis/urban-growth', params);
    return response.data;
  },

  // Simulation
  floodSimulation: async (params: {
    bbox: [number, number, number, number];
    waterLevel: number;
    rainfall: number;
  }) => {
    const response = await apiClient.post('/api/simulation/flood', params);
    return response.data;
  },

  trafficSimulation: async (params: {
    center: [number, number];
    radius: number;
    timeOfDay: string;
  }) => {
    const response = await apiClient.post('/api/simulation/traffic', params);
    return response.data;
  },

  urbanDevelopmentSimulation: async (params: {
    bbox: [number, number, number, number];
    growthRate: number;
    years: number;
  }) => {
    const response = await apiClient.post('/api/simulation/urban-development', params);
    return response.data;
  },
};

export default api;
