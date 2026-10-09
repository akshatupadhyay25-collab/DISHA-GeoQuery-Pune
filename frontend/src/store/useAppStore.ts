import { create } from 'zustand';
import { ChatMessage, QueryResult, SimulationResult, Detection } from '../types';

interface AppState {
  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  
  // Current Query
  currentQuery: QueryResult | null;
  setCurrentQuery: (query: QueryResult | null) => void;
  
  // Detections
  selectedDetection: Detection | null;
  setSelectedDetection: (det: Detection | null) => void;
  
  // Map
  mapView: '2d' | '3d';
  setMapView: (view: '2d' | '3d') => void;
  
  // Simulation
  simulation: SimulationResult | null;
  setSimulation: (sim: SimulationResult | null) => void;
  
  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Voice
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  
  // User Location
  userLocation: { lat: number; lon: number } | null;
  setUserLocation: (loc: { lat: number; lon: number } | null) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  showResults: boolean;
  setShowResults: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  
  currentQuery: null,
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  selectedDetection: null,
  setSelectedDetection: (det) => set({ selectedDetection: det }),
  
  mapView: '2d',
  setMapView: (view) => set({ mapView: view }),
  
  simulation: null,
  setSimulation: (sim) => set({ simulation: sim }),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  
  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),
  
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  showResults: true,
  setShowResults: (show) => set({ showResults: show }),
}));
