import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapView } from '../components/MapView';
import { StatsCard } from '../components/StatsCard';
import { RecentQueries } from '../components/RecentQueries';
import { 
  MapPin, 
  Building2, 
  Route, 
  Droplets,
  Search,
  TrendingUp,
  ArrowUpRight,
  Compass
} from 'lucide-react';

const MotionLink = motion(Link);

export function Dashboard() {
  const stats = [
    { 
      icon: Building2, 
      label: 'Buildings', 
      value: '125,432', 
      change: '+2.3%',
      color: 'from-primary to-primary/70',
      bgColor: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20'
    },
    { 
      icon: Route, 
      label: 'Roads', 
      value: '58,234', 
      change: '+1.8%',
      color: 'from-primary to-primary/70',
      bgColor: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20'
    },
    { 
      icon: Droplets, 
      label: 'Waterways', 
      value: '1,234', 
      change: '+0.5%',
      color: 'from-status-success to-status-success/70',
      bgColor: 'bg-status-success/10 text-status-success',
      borderColor: 'border-status-success/20'
    },
    { 
      icon: MapPin, 
      label: 'POIs', 
      value: '8,567', 
      change: '+3.1%',
      color: 'from-status-success to-status-success/70',
      bgColor: 'bg-status-success/10 text-status-success',
      borderColor: 'border-status-success/20'
    },
  ];

  return (
    <div className="min-h-full space-y-7 overflow-auto p-5 sm:p-7 xl:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Compass className="h-4 w-4" />
            <span>GeoAI workspace</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">Pune region</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Spatial intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore geospatial features, review recent searches, and launch an analysis.
          </p>
        </div>
        <Link
          to="/query"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105"
        >
          <Search className="h-4 w-4" />
          New geospatial query
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Pune at a glance</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Coverage indicators</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="h-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-md shadow-slate-900/5 sm:h-[500px] xl:col-span-2"
        >
          <MapView />
        </motion.div>

        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-[420px] min-h-0 sm:h-[500px]"
        >
          <RecentQueries />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <QuickAction
          title="Natural Language Query"
          description="Search infrastructure using plain English"
          icon={Search}
          color="from-primary to-primary/70"
          href="/query"
        />
        <QuickAction
          title="Temporal Analysis"
          description="Detect changes between time periods"
          icon={TrendingUp}
          color="from-primary to-primary/70"
          href="/analysis"
        />
        <QuickAction
          title="Flood Simulation"
          description="Simulate flood scenarios"
          icon={Droplets}
          color="from-status-success to-status-success/70"
          href="/simulation"
        />
      </motion.div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: typeof Search;
  color: string;
  href: string;
}

function QuickAction({ title, description, icon: Icon, color, href }: QuickActionProps) {
  return (
    <MotionLink
      to={href}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-[0.06]`} />
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground">
        {title}
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </MotionLink>
  );
}
