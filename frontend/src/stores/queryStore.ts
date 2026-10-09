import { create } from 'zustand';

interface Query {
  query: string;
  timestamp: Date;
}

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  status: 'completed' | 'failed' | 'pending';
}

interface QueryState {
  currentQuery: Query | null;
  history: HistoryItem[];
  setCurrentQuery: (query: Query) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useQueryStore = create<QueryState>((set) => ({
  currentQuery: null,
  history: [],
  
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  addToHistory: (item) =>
    set((state) => ({
      history: [item, ...state.history].slice(0, 50), // Keep last 50 items
    })),
  
  clearHistory: () => set({ history: [] }),
  
  removeFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    })),
}));
