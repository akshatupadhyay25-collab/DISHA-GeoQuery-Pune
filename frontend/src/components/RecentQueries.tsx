import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useQueryStore } from '../stores/queryStore';

export function RecentQueries() {
  const history = useQueryStore((state) => state.history);
  const recentQueries = history.slice(0, 5);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Recent queries</h2>
          <p className="mt-1 text-xs text-muted-foreground">Your latest searches</p>
        </div>
        <Link to="/history" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {recentQueries.map((query, index) => (
          <motion.div
            key={query.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/30"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">
                {query.query}
              </p>
              <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
                query.status === 'completed'
                  ? 'bg-status-success/10 text-status-success'
                  : query.status === 'failed'
                    ? 'bg-status-error/10 text-status-error'
                    : 'bg-status-info/10 text-status-info'
              }`}>
                {query.status === 'completed' ? `${query.resultCount} results` : query.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(parseISO(query.timestamp), { addSuffix: true })}</span>
            </div>
          </motion.div>
        ))}

        {recentQueries.length === 0 && (
          <div className="flex h-full min-h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No queries yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Your recent searches will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
