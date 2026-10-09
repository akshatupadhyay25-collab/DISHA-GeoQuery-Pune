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
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Flood Simulation</h1>
        <p className="text-muted-foreground">Simulate flood scenarios and assess risk</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-3"
      >
        {/* River Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">River</label>
          <select
            value={river}
            onChange={(e) => setRiver(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="Mula River">Mula River</option>
            <option value="Mutha River">Mutha River</option>
            <option value="Pavana River">Pavana River</option>
          </select>
        </div>

        {/* Water Level */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Water Level: {waterLevel}m
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={waterLevel}
            onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
            className="h-3 w-full rounded-xl border border-input bg-muted outline-none accent-primary focus:border-primary"
          />
        </div>

        {/* Simulate Button */}
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
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
          className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-slate-900/5"
        >
          <MapView />
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="border-b border-border p-6">
            <h2 className="mb-2 text-xl font-bold text-foreground">Risk Assessment</h2>
            <p className="text-sm text-muted-foreground">
              {river} - {waterLevel}m water level
            </p>
          </div>

          {/* Risk Stats */}
          <div className="p-6 space-y-4">
            {!results ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <CloudRain className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Run simulation to assess risk</p>
                </div>
              </div>
            ) : (
              <>
                {/* High Risk */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-status-error/25 bg-status-error/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-status-error" />
                      <span className="text-sm font-medium text-status-error">High Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-status-error">{results.highRisk || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Buildings in immediate danger</p>
                </motion.div>

                {/* Medium Risk */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-status-warning/25 bg-status-warning/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-status-warning" />
                      <span className="text-sm font-medium text-status-warning">Medium Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-status-warning">{results.mediumRisk || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Buildings at moderate risk</p>
                </motion.div>

                {/* Affected Population */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-status-info/25 bg-status-info/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-status-info" />
                      <span className="text-sm font-medium text-status-info">Population</span>
                    </div>
                    <span className="text-2xl font-bold text-status-info">{results.affectedPopulation || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Estimated people affected</p>
                </motion.div>

                {/* Total Buildings */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Total Affected</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{results.totalAffected || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Buildings in flood zone</p>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
