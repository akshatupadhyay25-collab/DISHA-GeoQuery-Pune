import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '../components/MapView';
import { CloudRain, Play, AlertTriangle, Home, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function SimulationPage() {
  const [waterLevel, setWaterLevel] = useState(3);
  const [river, setRiver] = useState('Mula River');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    toast.loading('Running flood simulation...', { id: 'simulation' });

    try {
      const response = await fetch('/api/simulation/flood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waterLevel, river })
      });

      const data = await response.json();
      setResults(data);
      toast.success('Simulation complete', { id: 'simulation' });
    } catch (error) {
      toast.error('Simulation failed', { id: 'simulation' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Flood Simulation</h1>
        <p className="text-slate-400">Simulate flood scenarios and assess risk</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
      >
        {/* River Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">River</label>
          <select
            value={river}
            onChange={(e) => setRiver(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-orange-500/50 transition-colors"
          >
            <option value="Mula River">Mula River</option>
            <option value="Mutha River">Mutha River</option>
            <option value="Pavana River">Pavana River</option>
          </select>
        </div>

        {/* Water Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Water Level: {waterLevel}m
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={waterLevel}
            onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
            className="w-full h-3 rounded-xl bg-slate-900/50 border border-slate-700/50 outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>

        {/* Simulate Button */}
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isSimulating ? 'Simulating...' : 'Simulate'}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl"
        >
          <MapView />
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-2">Risk Assessment</h2>
            <p className="text-sm text-slate-400">
              {river} - {waterLevel}m water level
            </p>
          </div>

          {/* Risk Stats */}
          <div className="p-6 space-y-4">
            {!results ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <CloudRain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Run simulation to assess risk</p>
                </div>
              </div>
            ) : (
              <>
                {/* High Risk */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium text-red-400">High Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-red-400">{results.highRisk || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400">Buildings in immediate danger</p>
                </motion.div>

                {/* Medium Risk */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-medium text-orange-400">Medium Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-400">{results.mediumRisk || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400">Buildings at moderate risk</p>
                </motion.div>

                {/* Affected Population */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Population</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{results.affectedPopulation || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400">Estimated people affected</p>
                </motion.div>

                {/* Total Buildings */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Total Affected</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{results.totalAffected || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400">Buildings in flood zone</p>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
