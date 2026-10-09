import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Detection } from '../types';

export function ResultsPanel() {
  const { currentQuery, selectedDetection, setSelectedDetection, setShowResults } = useAppStore();

  if (!currentQuery) return null;

  const detections = currentQuery.results.detections || [];

  return (
    <div className="h-full flex flex-col glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Results</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {detections.length} feature{detections.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowResults(false)}
          className="w-8 h-8 rounded-lg hover:bg-surface-primary flex items-center justify-center transition-smooth"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Insights */}
      {currentQuery.insights && (
        <div className="px-5 py-3 bg-brand-light border-b border-border">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-brand leading-relaxed">{currentQuery.insights}</p>
          </div>
        </div>
      )}

      {/* Detection List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {detections.map((det: Detection, index: number) => {
          const isSelected = selectedDetection?.center_lat === det.center_lat &&
            selectedDetection?.center_lon === det.center_lon;

          const confidenceColor = det.confidence > 0.8 ? 'bg-status-success' :
                                   det.confidence > 0.6 ? 'bg-status-warning' : 'bg-status-error';

          return (
            <div
              key={index}
              onClick={() => setSelectedDetection(det)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in ${
                isSelected
                  ? 'bg-brand-light border-2 border-brand shadow-md'
                  : 'bg-surface-main border border-border hover:border-border-strong hover:shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
                  <h3 className="text-sm font-semibold text-text-primary capitalize">
                    {det.detection_class}
                  </h3>
                </div>
                <span className={`text-xs font-mono font-medium tabular-nums px-2 py-0.5 rounded ${
                  det.confidence > 0.8 ? 'bg-status-success/10 text-status-success' :
                  det.confidence > 0.6 ? 'bg-status-warning/10 text-status-warning' :
                  'bg-status-error/10 text-status-error'
                }`}>
                  {(det.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-mono tabular-nums text-[11px]">
                    {det.center_lat.toFixed(5)}°N, {det.center_lon.toFixed(5)}°E
                  </span>
                </div>

                {det.distance_to_target && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                    </svg>
                    <span>{det.distance_to_target.toFixed(0)}m from target</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-text-tertiary">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-mono text-[11px]">{det.model}</span>
                </div>
              </div>

              {/* Explanation (expanded when selected) */}
              {isSelected && det.explanation && (
                <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {det.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {detections.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-text-tertiary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-text-secondary">No results</p>
            <p className="text-xs text-text-tertiary mt-1">Try a different query</p>
          </div>
        )}
      </div>
    </div>
  );
}
