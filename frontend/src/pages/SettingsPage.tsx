import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Eye, EyeOff, Globe, Database, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    gemini: 'AQ.Ab8RN6IkBZ8O3lIx6N-F9X15pFFQKB_lcgismftr7uJCNz5Fxg',
    mapbox: 'pk.eyJ1IjoiYWtzaGF0LTEyMyIsImEiOiJjbXYwdXU4dG0wYmFpMnpxdHBnbzN4YXhrIn0.Pgwyo_vyrRAanyFh9FEueQ',
    planet: 'PLAK0951b83955b24f5e93e55ea0f3a1029a'
  });

  const [showKeys, setShowKeys] = useState({
    gemini: false,
    mapbox: false,
    planet: false
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
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
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure API keys and preferences</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">API Keys</h2>
          </div>

          {/* Gemini API Key */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                placeholder="Enter Gemini API key"
              />
              <button
                onClick={() => toggleKeyVisibility('gemini')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showKeys.gemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Used for natural language query understanding</p>
          </div>

          {/* Mapbox Token */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mapbox Access Token
            </label>
            <div className="relative">
              <input
                type={showKeys.mapbox ? 'text' : 'password'}
                value={apiKeys.mapbox}
                onChange={(e) => setApiKeys(prev => ({ ...prev, mapbox: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                placeholder="Enter Mapbox token"
              />
              <button
                onClick={() => toggleKeyVisibility('mapbox')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showKeys.mapbox ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Used for satellite imagery and maps</p>
          </div>

          {/* Planet API Key */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Planet Labs API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.planet ? 'text' : 'password'}
                value={apiKeys.planet}
                onChange={(e) => setApiKeys(prev => ({ ...prev, planet: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                placeholder="Enter Planet API key"
              />
              <button
                onClick={() => toggleKeyVisibility('planet')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showKeys.planet ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Used for high-resolution satellite imagery</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Preferences</h2>
          </div>

          {/* Theme */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  preferences.theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  preferences.theme === 'light'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                }`}
              >
                ☀️ Light
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Default Area */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-2">Default Area</label>
            <select
              value={preferences.defaultArea}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultArea: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="Pune City">Pune City</option>
              <option value="Kothrud">Kothrud</option>
              <option value="Baner">Baner</option>
              <option value="Hinjewadi">Hinjewadi</option>
              <option value="Viman Nagar">Viman Nagar</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-300">Auto-save queries</span>
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="w-5 h-5 rounded-lg bg-slate-900/50 border border-slate-700/50 text-blue-500 focus:ring-blue-500/50"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-300">Enable notifications</span>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                className="w-5 h-5 rounded-lg bg-slate-900/50 border border-slate-700/50 text-blue-500 focus:ring-blue-500/50"
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
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </motion.button>
      </motion.div>
    </div>
  );
}
