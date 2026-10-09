import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';

export function TopBar() {
  const { currentQuery, messages, sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div className="glass-panel rounded-xl px-5 py-3 flex items-center justify-between">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg bg-surface-primary hover:bg-border-subtle flex items-center justify-center transition-smooth"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary leading-tight">
              DISHA
            </h1>
            <p className="text-[11px] text-text-tertiary leading-tight">
              GeoAI Query Engine
            </p>
          </div>
        </div>
      </div>

      {/* Center - Model Indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-surface-primary border border-border text-[11px] font-medium text-text-secondary">
            SkyCLIP
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface-primary border border-border text-[11px] font-medium text-text-secondary">
            OWL-ViT
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface-primary border border-border text-[11px] font-medium text-text-secondary">
            Gemini
          </span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {currentQuery && (
          <>
            <a
              href={api.getGeoJsonUrl(currentQuery.query_id)}
              className="px-3.5 py-2 rounded-lg bg-surface-primary hover:bg-border-subtle text-text-secondary hover:text-text-primary text-xs font-medium transition-smooth flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              GeoJSON
            </a>
            <a
              href={api.getReportUrl(currentQuery.query_id)}
              className="px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-primary-foreground text-xs font-medium transition-smooth flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
            </a>
          </>
        )}
      </div>
    </div>
  );
}
