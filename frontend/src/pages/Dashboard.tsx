import { motion } from 'framer-motion';
import { MapView } from '../components/MapView';
import { StatsCard } from '../components/StatsCard';
import { RecentQueries } from '../components/RecentQueries';
import { 
  MapPin, 
  Building2, 
  Route, 
  Droplets,
  TrendingUp,
  Zap
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    { 
      icon: Building2, 
      label: 'Buildings', 
      value: '125,432', 
      change: '+2.3%',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      icon: Route, 
      label: 'Roads', 
      value: '58,234', 
      change: '+1.8%',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    { 
      icon: Droplets, 
      label: 'Waterways', 
      value: '1,234', 
      change: '+0.5%',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    { 
      icon: MapPin, 
      label: 'POIs', 
      value: '8,567', 
      change: '+3.1%',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
  ];

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome to DISHA GeoQuery Pune</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Real-time Data</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl"
        >
          <MapView />
        </motion.div>

        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-[500px]"
        >
          <RecentQueries />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <QuickAction
          title="Natural Language Query"
          description="Search infrastructure using plain English"
          icon={TrendingUp}
          color="from-blue-500 to-cyan-500"
          href="/query"
        />
        <QuickAction
          title="Temporal Analysis"
          description="Detect changes between time periods"
          icon={TrendingUp}
          color="from-purple-500 to-pink-500"
          href="/analysis"
        />
        <QuickAction
          title="Flood Simulation"
          description="Simulate flood scenarios"
          icon={Droplets}
          color="from-orange-500 to-red-500"
          href="/simulation"
        />
      </motion.div>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, color, href }: any) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </motion.a>
  );
}
