import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: any;
  label: string;
  value: string;
  change: string;
  color: string;
  bgColor: string;
  borderColor: string;
  index: number;
}

export function StatsCard({ icon: Icon, label, value, change, color, bgColor, borderColor, index }: StatsCardProps) {
  const isPositive = change.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative p-6 rounded-2xl bg-slate-800/50 border ${borderColor} backdrop-blur-sm overflow-hidden group`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 relative z-10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
