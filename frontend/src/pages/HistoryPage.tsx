import { motion } from 'framer-motion';
import { Clock, MapPin, Search, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const mockHistory = [
  {
    id: 1,
    query: 'Find schools near flood-prone areas',
    timestamp: '2024-01-15 14:23:45',
    results: 23,
    area: 'Pune City'
  },
  {
    id: 2,
    query: 'Hospitals within 5km of highways',
    timestamp: '2024-01-15 13:45:12',
    results: 47,
    area: 'Pune City'
  },
  {
    id: 3,
    query: 'Industrial zones near water bodies',
    timestamp: '2024-01-15 11:30:00',
    results: 12,
    area: 'Hinjewadi'
  },
  {
    id: 4,
    query: 'Residential areas with high population density',
    timestamp: '2024-01-14 16:20:33',
    results: 156,
    area: 'Kothrud'
  },
  {
    id: 5,
    query: 'Emergency services coverage analysis',
    timestamp: '2024-01-14 14:15:22',
    results: 34,
    area: 'Baner'
  },
  {
    id: 6,
    query: 'Commercial buildings near metro stations',
    timestamp: '2024-01-14 10:05:18',
    results: 89,
    area: 'Viman Nagar'
  },
  {
    id: 7,
    query: 'Parks and recreational areas',
    timestamp: '2024-01-13 15:45:00',
    results: 67,
    area: 'Pune City'
  },
  {
    id: 8,
    query: 'Educational institutions analysis',
    timestamp: '2024-01-13 12:30:45',
    results: 145,
    area: 'Pune City'
  }
];

export function HistoryPage() {
  const handleDelete = (id: number) => {
    toast.success('Query deleted from history');
  };

  const handleExport = () => {
    toast.success('History exported successfully');
  };

  const handleClearAll = () => {
    toast.success('All history cleared');
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Query History</h1>
          <p className="text-slate-400">View and manage your past queries</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600/50 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Total Queries</p>
          <p className="text-3xl font-bold text-white">{mockHistory.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Total Results</p>
          <p className="text-3xl font-bold text-white">
            {mockHistory.reduce((sum, q) => sum + q.results, 0)}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Areas Searched</p>
          <p className="text-3xl font-bold text-white">
            {new Set(mockHistory.map(q => q.area)).size}
          </p>
        </div>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-auto space-y-3"
      >
        {mockHistory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {item.query}
                    </h3>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{item.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{item.area}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                  {item.results} results
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
