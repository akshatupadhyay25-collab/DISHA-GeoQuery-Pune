import axios from 'axios';
import { QueryResult, SimulationResult, TemporalResult } from '../types';

const API_BASE = '/api';

export const api = {
  // Main query
  async submitQuery(query: string, sessionId?: string): Promise<QueryResult> {
    const response = await axios.post(`${API_BASE}/query`, { query, session_id: sessionId });
    return response.data;
  },

  async getQueryResult(queryId: string): Promise<QueryResult> {
    const response = await axios.get(`${API_BASE}/query/${queryId}`);
    return response.data;
  },

  async refineQuery(originalQueryId: string, refinement: string): Promise<QueryResult> {
    const response = await axios.post(`${API_BASE}/query/refine`, {
      original_query_id: originalQueryId,
      refinement
    });
    return response.data;
  },

  // Simulation
  async simulateFlood(waterway: string, waterLevel: number): Promise<SimulationResult> {
    const response = await axios.post(`${API_BASE}/simulate`, {
      simulation_type: 'flood',
      waterway,
      water_level_meters: waterLevel
    });
    return response.data;
  },

  // Temporal
  async temporalChange(area: string, year1: number, year2: number): Promise<TemporalResult> {
    const response = await axios.post(`${API_BASE}/temporal`, { area, year1, year2 });
    return response.data;
  },

  // Export
  getGeoJsonUrl(queryId: string): string {
    return `${API_BASE}/export/geojson/${queryId}`;
  },

  getReportUrl(queryId: string): string {
    return `${API_BASE}/export/report/${queryId}`;
  },

  // Voice query
  async voiceQuery(audioText: string, lat?: number, lon?: number): Promise<QueryResult> {
    const response = await axios.post(`${API_BASE}/voice/query`, {
      audio_text: audioText,
      latitude: lat,
      longitude: lon
    });
    return response.data;
  },

  // Context
  async getPuneContext() {
    const response = await axios.get(`${API_BASE}/context/pune`);
    return response.data;
  },

  // History
  async getHistory(limit: number = 20) {
    const response = await axios.get(`${API_BASE}/history`, { params: { limit } });
    return response.data;
  },

  // Explainability
  async getExplainability(queryId: string, detectionIndex: number = 0) {
    const response = await axios.get(`${API_BASE}/explain/${queryId}/${detectionIndex}`);
    return response.data;
  }
};
