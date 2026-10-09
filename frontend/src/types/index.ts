export interface Detection {
  id: string;
  type: string;
  name: string;
  coordinates?: [number, number];
  confidence?: number;
  bbox?: any;
  distance_to_target?: number;
  model?: string;
  explanation?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface QueryResult {
  id: string;
  query_id?: string;
  query: string;
  timestamp: string;
  total_found?: number;
  processing_time_ms?: number;
  results: {
    detections: Detection[];
    count: number;
    total_found?: number;
    tiles_searched?: number;
    tile_results?: any[];
    [key: string]: any;
  };
  telemetry?: {
    models: string[];
    processingTime: number;
    confidence: number;
    sources: string[];
  };
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  role?: 'user' | 'assistant';
  type?: string;
  content: string;
  query_id?: string;
  result?: QueryResult;
  timestamp: string | Date;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface SimulationResult {
  id: string;
  type: string;
  timestamp: string;
  summary?: any;
  data: any;
  parameters: Record<string, any>;
  [key: string]: any;
}

export interface TemporalResult {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  [key: string]: any;
}
