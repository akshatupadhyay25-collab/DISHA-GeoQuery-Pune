import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
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
      className={`group relative overflow-hidden rounded-2xl border ${borderColor} bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Icon */}
      <div className={`relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            isPositive ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
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
