import { motion } from 'framer-motion';
import { Clock, MapPin, TrendingUp } from 'lucide-react';

const mockQueries = [
  {
    id: 1,
    query: 'Find schools near flood-prone areas',
    timestamp: '2 mins ago',
    results: 23,
    status: 'success'
  },
  {
    id: 2,
    query: 'Hospitals within 5km of highways',
    timestamp: '15 mins ago',
    results: 47,
    status: 'success'
  },
  {
    id: 3,
    query: 'Industrial zones near water bodies',
    timestamp: '1 hour ago',
    results: 12,
    status: 'success'
  },
  {
    id: 4,
    query: 'Residential areas with high population density',
    timestamp: '3 hours ago',
    results: 156,
    status: 'success'
  },
  {
    id: 5,
    query: 'Emergency services coverage analysis',
    timestamp: '5 hours ago',
    results: 34,
    status: 'success'
  }
];

export function RecentQueries() {
  return (
    <div className="h-full flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Queries</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-green-400 hover:text-green-300 font-medium"
          >
            View All
          </motion.button>
        </div>
      </div>

      {/* Queries List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {mockQueries.map((query, index) => (
          <motion.div
            key={query.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-white font-medium text-sm flex-1 group-hover:text-green-400 transition-colors">
                {query.query}
              </p>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">{query.results}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{query.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Pune Region</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
