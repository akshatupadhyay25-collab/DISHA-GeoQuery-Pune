import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Building, Droplets, Leaf, Navigation } from 'lucide-react';
import { PromptInput } from '@/components/ui/ai-chat-input';
import { MapView } from '@/components/MapView';
import { api } from '@/services/api';
import { useQueryStore } from '@/stores/queryStore';
import toast from 'react-hot-toast';

const QueryPage = () => {
  const { setCurrentQuery, addToHistory } = useQueryStore();
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [_mapData, setMapData] = useState<any>(null);

  const suggestedPrompts = [
    {
      icon: Search,
      label: 'Find all schools',
      description: 'Locate educational institutions in Pune',
    },
    {
      icon: Building,
      label: 'Analyze urban growth',
      description: 'Study development patterns over time',
    },
    {
      icon: Droplets,
      label: 'Map water bodies',
      description: 'Identify lakes, rivers, and reservoirs',
    },
    {
      icon: Leaf,
      label: 'Green cover analysis',
      description: 'Assess vegetation and parks',
    },
  ];

  const handleSubmit = async (query: string, meta: { model: string; effort: string; attachments: File[] }) => {
    if (!query.trim()) return;

    setLoading(true);
    setQuerySubmitted(true);
    setCurrentQuery({ query, timestamp: new Date() });

    try {
      // Call the search API
      const response = await api.search({
        query: query,
        latitude: 18.5204,
        longitude: 73.8567,
        radius: 10000,
        useAI: true,
      });

      setResults(response.results || []);
      setTelemetry(response.telemetry || null);
      setMapData(response.mapData || null);

      // Add to history
      addToHistory({
        id: Date.now().toString(),
        query: query,
        timestamp: new Date().toISOString(),
        resultCount: response.results?.length || 0,
        status: 'completed',
      });

      toast.success(`Found ${response.results?.length || 0} results`);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to execute query');
      
      // Add failed query to history
      addToHistory({
        id: Date.now().toString(),
        query: query,
        timestamp: new Date().toISOString(),
        resultCount: 0,
        status: 'failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuerySubmitted(false);
    setResults([]);
    setTelemetry(null);
    setMapData(null);
    setCurrentInput('');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Background Map - appears after query submission */}
      <AnimatePresence>
        {querySubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 z-0"
          >
            <MapView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full">
        {/* Search Bar - animates from center to top-left */}
        <motion.div
          initial={false}
          animate={
            querySubmitted
              ? {
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  right: 'auto',
                  width: 'auto',
                  maxWidth: '640px',
                }
              : {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  width: '100%',
                  maxWidth: '640px',
                  x: '-50%',
                  y: '-50%',
                }
          }
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: 0.6,
          }}
          className="w-full"
          style={
            querySubmitted
              ? { transform: 'none' }
              : { transform: 'translate(-50%, -50%)' }
          }
        >
          <PromptInput
            onSubmit={handleSubmit}
            placeholder="Ask DISHA anything about Pune..."
            className={querySubmitted ? 'w-[640px]' : 'w-full max-w-[640px]'}
            value={currentInput}
            onChange={setCurrentInput}
          />
        </motion.div>

        {/* Suggested Prompts - only show before query submission */}
        <AnimatePresence>
          {!querySubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute top-[60%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setCurrentInput(prompt.label)}
                    className="group p-4 rounded-lg bg-card/80 backdrop-blur-md border border-border/50 hover:border-primary/50 hover:bg-card transition-all text-left"
                  >
                    <prompt.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-foreground mb-1">
                      {prompt.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prompt.description}
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
                  <Sparkles className="h-4 w-4" />
                  Powered by SkyCLIP, OWL-ViT, Gemini, and SegFormer
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Panel - appears after query submission */}
        <AnimatePresence>
          {querySubmitted && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute top-24 left-6 w-80 max-h-[calc(100vh-140px)] overflow-y-auto"
            >
              <div className="rounded-lg bg-card/90 backdrop-blur-md border border-border/50 p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Results ({results.length})
                  </h3>
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    New Query
                  </button>
                </div>

                <div className="space-y-3">
                  {results.slice(0, 10).map((result: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="p-3 rounded-md bg-background/50 border border-border/30 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {result.name || `Result ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {result.type || 'Location'}
                          </div>
                          {result.coordinates && (
                            <div className="text-xs text-muted-foreground/70 mt-1 font-mono">
                              {result.coordinates[1].toFixed(4)}, {result.coordinates[0].toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Telemetry Panel - appears on the right side */}
        <AnimatePresence>
          {querySubmitted && telemetry && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="absolute top-24 right-6 w-80"
            >
              <div className="rounded-lg bg-card/90 backdrop-blur-md border border-border/50 p-4 shadow-2xl">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analysis
                </h3>

                <div className="space-y-4">
                  {telemetry.models && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Models Used
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {telemetry.models.map((model: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {telemetry.processingTime && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Processing Time
                      </div>
                      <div className="text-sm text-foreground">
                        {telemetry.processingTime}ms
                      </div>
                    </div>
                  )}

                  {telemetry.confidence && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Confidence Score
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${telemetry.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {Math.round(telemetry.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {telemetry.sources && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Data Sources
                      </div>
                      <div className="space-y-1">
                        {telemetry.sources.map((source: string, index: number) => (
                          <div
                            key={index}
                            className="text-xs text-foreground/80 flex items-center gap-2"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">
                  Analyzing with AI...
                </div>
                <div className="text-sm text-muted-foreground">
                  Processing your query with multiple AI models
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { QueryPage };
export default QueryPage;
