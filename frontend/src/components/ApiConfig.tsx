import React, { useState, useEffect } from 'react';

interface ConfigProps {
  onClose: () => void;
}

export function ApiConfig({ onClose }: ConfigProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setGeminiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-main rounded-xl shadow-xl max-w-md w-full mx-4 animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">API Configuration</h2>
              <p className="text-sm text-text-secondary mt-1">Configure your API keys</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-primary flex items-center justify-center transition-smooth"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-main text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-smooth"
              />
              <p className="text-xs text-text-tertiary mt-2">
                Get your free API key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-brand-light rounded-lg p-4 border border-brand/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-brand">
                  <p className="font-medium mb-1">About API Keys</p>
                  <ul className="space-y-1 text-brand-dark">
                    <li>• Gemini key is used for natural language query understanding</li>
                    <li>• The app works without it (uses fallback parsing)</li>
                    <li>• Keys are stored locally in your browser</li>
                    <li>• Never shared with third parties</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-surface-primary transition-smooth text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-primary-foreground transition-smooth text-sm font-medium"
            >
              {saved ? '✓ Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
