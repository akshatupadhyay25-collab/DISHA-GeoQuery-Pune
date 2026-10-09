import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Eye, EyeOff, Globe, Database, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

export function SettingsPage() {
  const { theme, setTheme } = useAppStore();
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    mapbox: '',
    planet: ''
  });

  const [showKeys, setShowKeys] = useState({
    gemini: false,
    mapbox: false,
    planet: false
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    defaultArea: 'Pune City',
    autoSave: true,
    notifications: true
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const toggleKeyVisibility = (key: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure API keys and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Key className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">API Keys</h2>
          </div>

          {/* Gemini API Key */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Enter Gemini API key"
              />
              <button
                onClick={() => toggleKeyVisibility('gemini')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showKeys.gemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Used for natural language query understanding</p>
          </div>

          {/* Mapbox Token */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Mapbox Access Token
            </label>
            <div className="relative">
              <input
                type={showKeys.mapbox ? 'text' : 'password'}
                value={apiKeys.mapbox}
                onChange={(e) => setApiKeys(prev => ({ ...prev, mapbox: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Enter Mapbox token"
              />
              <button
                onClick={() => toggleKeyVisibility('mapbox')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showKeys.mapbox ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Used for satellite imagery and maps</p>
          </div>

          {/* Planet API Key */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Planet Labs API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.planet ? 'text' : 'password'}
                value={apiKeys.planet}
                onChange={(e) => setApiKeys(prev => ({ ...prev, planet: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Enter Planet API key"
              />
              <button
                onClick={() => toggleKeyVisibility('planet')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showKeys.planet ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Used for high-resolution satellite imagery</p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Preferences</h2>
          </div>

          {/* Theme */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-foreground">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                }`}
              >
                ☀️ Light
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-foreground">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Default Area */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-foreground">Default Area</label>
            <select
              value={preferences.defaultArea}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultArea: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="Pune City">Pune City</option>
              <option value="Kothrud">Kothrud</option>
              <option value="Baner">Baner</option>
              <option value="Hinjewadi">Hinjewadi</option>
              <option value="Viman Nagar">Viman Nagar</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Auto-save queries</span>
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Enable notifications</span>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
              />
            </label>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-brand-hover"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </motion.button>
      </motion.div>
    </div>
  );
}
