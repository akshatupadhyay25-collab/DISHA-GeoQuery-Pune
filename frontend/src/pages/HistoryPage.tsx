import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Download, Search, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryStore } from '../stores/queryStore';

export function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useQueryStore();
  const resultCount = history.reduce(
    (total, item) => total + (item.status === 'completed' ? item.resultCount : 0),
    0
  );
  const completedCount = history.filter((item) => item.status === 'completed').length;

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    toast.success('Query deleted from history');
  };

  const handleExport = () => {
    const exportUrl = URL.createObjectURL(
      new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
    );
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = 'disha-query-history.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(exportUrl), 1000);
    toast.success('History exported');
  };

  const handleClearAll = () => {
    if (!window.confirm('Clear all saved query history? This cannot be undone.')) return;
    clearHistory();
    toast.success('Query history cleared');
  };

  return (
    <div className="flex min-h-full flex-col space-y-6 p-5 sm:p-7 xl:p-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Query history</h1>
          <p className="mt-2 text-muted-foreground">Review searches run in this session.</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={history.length === 0}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="flex items-center gap-2 rounded-xl border border-status-error/30 bg-status-error/10 px-4 py-2.5 text-sm font-medium text-status-error transition-colors hover:border-status-error/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <SummaryCard label="Queries run" value={history.length} />
        <SummaryCard label="Results returned" value={resultCount} />
        <SummaryCard label="Completed searches" value={completedCount} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.16 }}
        className="flex-1 space-y-3"
      >
        {history.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const StatusIcon = isCompleted ? CheckCircle2 : XCircle;

          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.24) }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-foreground">{item.query}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 font-medium ${
                        isCompleted
                          ? 'text-status-success'
                          : item.status === 'failed'
                            ? 'text-status-error'
                            : 'text-status-info'
                      }`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {isCompleted ? `${item.resultCount} results` : item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Delete query: ${item.query}`}
                  onClick={() => handleDelete(item.id)}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-status-error/10 hover:text-status-error focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          );
        })}

        {history.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-foreground">No queries yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Searches you run will appear here with their actual status and result count.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
