import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '../components/MapView';
import { Calendar, TrendingUp, Play, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AnalysisPage() {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [area, setArea] = useState('Pune City');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    toast.loading('Analyzing changes...', { id: 'analysis' });

    try {
      const response = await fetch('/api/analysis/temporal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, area })
      });

      const data = await response.json();
      setResults(data);
      toast.success('Analysis complete', { id: 'analysis' });
    } catch (error) {
      toast.error('Analysis failed', { id: 'analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Temporal Analysis</h1>
        <p className="text-slate-400">Detect changes between time periods</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
      >
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white outline-none focus:border-green-500/50 transition-colors"
          >
            <option value="Pune City">Pune City</option>
            <option value="Kothrud">Kothrud</option>
            <option value="Baner">Baner</option>
            <option value="Hinjewadi">Hinjewadi</option>
            <option value="Viman Nagar">Viman Nagar</option>
          </select>
        </div>

        {/* Analyze Button */}
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
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

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-2">Change Detection</h2>
            <p className="text-sm text-slate-400">
              {startDate} to {endDate}
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            {!results ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Run analysis to see results</p>
                </div>
              </div>
            ) : (
              <>
                <StatCard
                  label="New Constructions"
                  value={results.newConstructions || 0}
                  color="from-green-500 to-emerald-500"
                  icon={TrendingUp}
                />
                <StatCard
                  label="Demolitions"
                  value={results.demolitions || 0}
                  color="from-red-500 to-orange-500"
                  icon={TrendingUp}
                />
                <StatCard
                  label="Vegetation Change"
                  value={`${results.vegetationChange || 0}%`}
                  color="from-blue-500 to-cyan-500"
                  icon={TrendingUp}
                />
                <StatCard
                  label="Infrastructure Growth"
                  value={`${results.infrastructureGrowth || 0}%`}
                  color="from-purple-500 to-pink-500"
                  icon={TrendingUp}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
