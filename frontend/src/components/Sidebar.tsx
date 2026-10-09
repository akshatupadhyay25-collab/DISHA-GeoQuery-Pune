import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';

export function Sidebar() {
  const { messages, clearMessages, currentQuery, simulation, setSimulation, setCurrentQuery } = useAppStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'tools'>('chat');

  return (
    <div className="h-full flex flex-col glass-dark rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-sidebar-border">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-smooth ${
            activeTab === 'chat'
              ? 'text-sidebar-text bg-sidebar-surface border-b-2 border-brand'
              : 'text-sidebar-muted hover:text-sidebar-text'
          }`}
        >
          Conversation
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-smooth ${
            activeTab === 'tools'
              ? 'text-sidebar-text bg-sidebar-surface border-b-2 border-brand'
              : 'text-sidebar-muted hover:text-sidebar-text'
          }`}
        >
          Analysis Tools
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? <ChatTab /> : <ToolsTab />}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <button
          onClick={clearMessages}
          className="w-full px-3 py-2 rounded-lg bg-sidebar-surface hover:bg-sidebar-border text-sidebar-muted hover:text-sidebar-text text-xs font-medium transition-smooth"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}

function ChatTab() {
  const { messages } = useAppStore();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-sidebar-surface flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-sidebar-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-sidebar-muted">No conversations yet</p>
          <p className="text-xs text-sidebar-muted mt-1">Start by typing a query above</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`animate-fade-in ${msg.type === 'user' ? 'ml-4' : 'mr-4'}`}
          >
            <div
              className={`rounded-lg px-3 py-2.5 text-sm ${
                msg.type === 'user'
                  ? 'bg-brand text-white'
                  : 'bg-sidebar-surface text-sidebar-text border border-sidebar-border'
              }`}
            >
              {msg.type === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-sidebar-border">
                  <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-sidebar-muted">DISHA</span>
                </div>
              )}
              <p className="leading-relaxed">{msg.content}</p>
              
              {msg.query_id && (
                <div className="mt-2 pt-2 border-t border-sidebar-border flex gap-2">
                  <a
                    href={api.getGeoJsonUrl(msg.query_id)}
                    className="text-xs text-brand-light hover:text-white transition-smooth"
                  >
                    📥 GeoJSON
                  </a>
                  <a
                    href={api.getReportUrl(msg.query_id)}
                    className="text-xs text-brand-light hover:text-white transition-smooth"
                  >
                    📄 Report
                  </a>
                </div>
              )}
            </div>
            <p className="text-[10px] text-sidebar-muted mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

function ToolsTab() {
  const { setSimulation, setCurrentQuery } = useAppStore();
  const [waterway, setWaterway] = useState('mula_river');
  const [waterLevel, setWaterLevel] = useState(3.0);
  const [area, setArea] = useState('Kothrud');
  const [year1, setYear1] = useState(2022);
  const [year2, setYear2] = useState(2025);
  const [isRunning, setIsRunning] = useState(false);

  const runFloodSimulation = async () => {
    setIsRunning(true);
    try {
      const result = await api.simulateFlood(waterway, waterLevel);
      setSimulation(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    }
    setIsRunning(false);
  };

  const runTemporalAnalysis = async () => {
    setIsRunning(true);
    try {
      const result = await api.temporalChange(area, year1, year2);
      setCurrentQuery({
        id: `temporal_${Date.now()}`,
        query_id: `temporal_${Date.now()}`,
        query: `Changes in ${area} from ${year1} to ${year2}`,
        original_query: `Changes in ${area} from ${year1} to ${year2}`,
        parsed_query: {},
        results: {
          count: result.changes.length,
          total_found: result.changes.length,
          detections: result.changes.map((c: any) => ({
            detection_class: c.type === 'new_construction' ? 'New Construction' : 'Demolition',
            confidence: c.confidence,
            bbox: {
              lat_min: c.lat - 0.0003,
              lat_max: c.lat + 0.0003,
              lon_min: c.lon - 0.0003,
              lon_max: c.lon + 0.0003
            },
            center_lat: c.lat,
            center_lon: c.lon,
            tile_id: 'temporal',
            model: 'SegFormer',
            explanation: `${c.type === 'new_construction' ? 'New construction detected' : 'Structure demolition detected'} between ${year1}-${year2}`
          })),
          tiles_searched: 0,
          tile_results: []
        },
        geojson: result.change_geojson,
        insights: `Between ${year1} and ${year2}, ${area} saw ${result.summary.new_constructions} new constructions and ${result.summary.demolished} demolitions.`,
        processing_time_ms: 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Temporal analysis failed:', error);
    }
    setIsRunning(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Flood Simulator */}
      <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-text mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-status-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Flood Simulation
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-sidebar-muted mb-1.5 block">Waterway</label>
            <select
              value={waterway}
              onChange={(e) => setWaterway(e.target.value)}
              className="w-full bg-sidebar-bg border border-sidebar-border rounded-lg px-3 py-2 text-xs text-sidebar-text"
            >
              <option value="mula_river">Mula River</option>
              <option value="mutha_river">Mutha River</option>
              <option value="pavana_river">Pavana River</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-sidebar-muted mb-1.5 block">
              Water Level: <span className="text-sidebar-text font-medium">{waterLevel}m</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={waterLevel}
              onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={runFloodSimulation}
            disabled={isRunning}
            className="w-full bg-status-info hover:bg-status-info/90 disabled:opacity-50 rounded-lg py-2.5 text-xs font-medium text-white transition-smooth"
          >
            {isRunning ? '⏳ Simulating...' : '▶ Run Simulation'}
          </button>
        </div>
      </div>

      {/* Temporal Change Detection */}
      <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-text mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Temporal Analysis
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-sidebar-muted mb-1.5 block">Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-sidebar-bg border border-sidebar-border rounded-lg px-3 py-2 text-xs text-sidebar-text"
            >
              <option>Kothrud</option>
              <option>Baner</option>
              <option>Hinjewadi</option>
              <option>Viman Nagar</option>
              <option>Hadapsar</option>
              <option>Wakad</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-sidebar-muted mb-1.5 block">From</label>
              <input
                type="number"
                value={year1}
                onChange={(e) => setYear1(parseInt(e.target.value))}
                className="w-full bg-sidebar-bg border border-sidebar-border rounded-lg px-3 py-2 text-xs text-sidebar-text"
              />
            </div>
            <div>
              <label className="text-xs text-sidebar-muted mb-1.5 block">To</label>
              <input
                type="number"
                value={year2}
                onChange={(e) => setYear2(parseInt(e.target.value))}
                className="w-full bg-sidebar-bg border border-sidebar-border rounded-lg px-3 py-2 text-xs text-sidebar-text"
              />
            </div>
          </div>

          <button
            onClick={runTemporalAnalysis}
            disabled={isRunning}
            className="w-full bg-status-warning hover:bg-status-warning/90 disabled:opacity-50 rounded-lg py-2.5 text-xs font-medium text-white transition-smooth"
          >
            {isRunning ? '⏳ Analyzing...' : '▶ Detect Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
