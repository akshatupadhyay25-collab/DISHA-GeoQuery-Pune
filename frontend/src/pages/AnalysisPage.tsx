import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '../components/MapView';
import { Calendar, TrendingUp, Play, BarChart3, type LucideIcon } from 'lucide-react';
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
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Temporal Analysis</h1>
        <p className="text-muted-foreground">Detect changes between time periods</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-4"
      >
        {/* Start Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
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
          className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-slate-900/5"
        >
          <MapView />
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="border-b border-border p-6">
            <h2 className="mb-2 text-xl font-bold text-foreground">Change Detection</h2>
            <p className="text-sm text-muted-foreground">
              {startDate} to {endDate}
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            {!results ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Run analysis to see results</p>
                </div>
              </div>
            ) : (
              <>
                <StatCard
                  label="New Constructions"
                  value={results.newConstructions || 0}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Demolitions"
                  value={results.demolitions || 0}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Vegetation Change"
                  value={`${results.vegetationChange || 0}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Infrastructure Growth"
                  value={`${results.infrastructureGrowth || 0}%`}
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

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-border bg-background p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}
