import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { MapView } from '@/components/MapView';
import { api, type NaturalLanguageQueryResponse } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { useQueryStore } from '@/stores/queryStore';
import type { Detection, QueryResult } from '@/types';
import axios from 'axios';

const EXAMPLE_QUERIES = [
  'Find schools near Kothrud.',
  'Find buildings within 200 meters of the Mula River.',
  'Show construction changes in Baner between 2022 and 2025.',
  'Find water bodies in Pune.',
];

function getResultCoordinates(detection: Detection): [number, number] | null {
  const latitude = typeof detection.center_lat === 'number'
    ? detection.center_lat
    : typeof detection.coordinates?.[1] === 'number'
      ? detection.coordinates[1]
      : undefined;
  const longitude = typeof detection.center_lon === 'number'
    ? detection.center_lon
    : typeof detection.coordinates?.[0] === 'number'
      ? detection.coordinates[0]
      : undefined;

  if (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return [latitude, longitude];
  }

  const bbox = detection.bbox;
  if (
    bbox &&
    [bbox.lat_min, bbox.lat_max, bbox.lon_min, bbox.lon_max].every(
      (coordinate: unknown) => typeof coordinate === 'number' && Number.isFinite(coordinate),
    )
  ) {
    const centerLat = (bbox.lat_min + bbox.lat_max) / 2;
    const centerLon = (bbox.lon_min + bbox.lon_max) / 2;
    if (centerLat >= -90 && centerLat <= 90 && centerLon >= -180 && centerLon <= 180) {
      return [centerLat, centerLon];
    }
  }

  return null;
}

function getQueryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'The query could not be completed. Please try again.';
  }

  if (error.response?.status === 503) {
    const detail = error.response.data?.detail;
    return typeof detail === 'string'
      ? detail
      : 'The DISHA search service is not configured with a real search model and data source yet.';
  }

  if (error.response?.status === 400 || error.response?.status === 422) {
    const detail = error.response.data?.detail;
    return typeof detail === 'string'
      ? detail
      : 'DISHA could not understand this query. Try naming an infrastructure type and a Pune location.';
  }

  if (error.response?.status === 401 || error.response?.status === 403) {
    return 'The search service rejected this request because its backend credentials or permissions are not configured. Configure credentials on the backend; do not add API keys to frontend code.';
  }

  if (!error.response) {
    return 'Could not reach the DISHA backend. Check that the backend is running and that VITE_API_URL points to it.';
  }

  return 'The DISHA search request failed. Please try again, or check the backend logs for details.';
}

function normalizeDetections(response: NaturalLanguageQueryResponse): Detection[] {
  const detections = Array.isArray(response.results?.detections)
    ? response.results.detections
    : [];

  return detections.map((detection, index) => ({
    ...detection,
    id: detection.id || `${response.query_id}-${index}`,
    type: detection.type || detection.detection_class || 'feature',
    name: detection.name || detection.detection_class || `Result ${index + 1}`,
  }));
}

function toQueryResult(
  response: NaturalLanguageQueryResponse,
  detections: Detection[],
): QueryResult {
  const total = typeof response.results?.total_found === 'number'
    ? response.results.total_found
    : detections.length;

  return {
    id: response.query_id,
    query_id: response.query_id,
    query: response.original_query,
    timestamp: response.timestamp,
    total_found: total,
    processing_time_ms: response.processing_time_ms,
    parsed_query: response.parsed_query,
    insights: response.insights,
    geojson: response.geojson,
    results: {
      ...response.results,
      detections,
      count: total,
    },
  };
}

export function QueryPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [response, setResponse] = useState<NaturalLanguageQueryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { setCurrentQuery, setSelectedDetection } = useAppStore();
  const { addToHistory } = useQueryStore();

  useEffect(() => {
    if (!loading) return;
    setProgressMessage('Sending your query to the DISHA search service...');
    const timer = window.setTimeout(() => {
      setProgressMessage('The search service is still processing your request...');
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedQuery = query.trim();
    if (!submittedQuery || loading) return;

    setLoading(true);
    setErrorMessage('');
    setResponse(null);
    setDetections([]);
    setCurrentQuery(null);

    try {
      const result = await api.query(submittedQuery);
      const returnedDetections = normalizeDetections(result);
      const normalizedResult = toQueryResult(result, returnedDetections);

      setResponse(result);
      setDetections(returnedDetections);
      setCurrentQuery(normalizedResult);
      addToHistory({
        id: result.query_id || `${Date.now()}`,
        query: submittedQuery,
        timestamp: result.timestamp || new Date().toISOString(),
        resultCount: typeof result.results?.total_found === 'number'
          ? result.results.total_found
          : returnedDetections.length,
        status: 'completed',
      });
    } catch (error: unknown) {
      const message = getQueryErrorMessage(error);
      setErrorMessage(message);
      addToHistory({
        id: `${Date.now()}`,
        query: submittedQuery,
        timestamp: new Date().toISOString(),
        resultCount: 0,
        status: 'failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    setLocationMessage('');
    if (!navigator.geolocation) {
      setLocationMessage('Location is unavailable in this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFocusLocation({ lat: coords.latitude, lon: coords.longitude });
        setLocationMessage('Map centered on your current location.');
        setLocationLoading(false);
      },
      (positionError) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location access in your browser settings and try again.',
          2: 'Your current location could not be determined. Check your device location settings and retry.',
          3: 'The location request timed out. Please try again.',
        };
        setLocationMessage(
          messages[positionError.code] || 'Unable to retrieve your location. Please try again.',
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const resultCount = response
    ? typeof response.results?.total_found === 'number'
      ? response.results.total_found
      : detections.length
    : 0;

  return (
    <div className="min-h-full bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <header>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            NATURAL-LANGUAGE GEOSEARCH
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ask DISHA about Pune</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Describe the infrastructure or area you want to explore. Results and map locations come from the search service.
          </p>
        </header>

        <div className="grid min-h-[640px] grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(340px,0.72fr)_minmax(0,1.75fr)]">
          <section className="flex min-h-0 flex-col gap-4">
            <form
              onSubmit={handleSearch}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <label htmlFor="disha-query" className="mb-2 block text-sm font-semibold">
                What are you looking for?
              </label>
              <textarea
                id="disha-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="For example, find schools near Kothrud..."
                rows={4}
                maxLength={1000}
                disabled={loading}
                className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Use a place name or describe a spatial relationship.
                </span>
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    : <Search className="h-4 w-4" aria-hidden="true" />}
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold">Try an example</h2>
              <div className="mt-3 grid gap-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    disabled={loading}
                    className="group flex w-full items-start gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="flex-1 leading-5">{example}</span>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Search area</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use your device location to center the map. Location is requested only on click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-60"
                >
                  {locationLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
                  Use My Location
                </button>
              </div>
              {locationMessage && (
                <p
                  role="status"
                  className={`mt-3 flex items-start gap-2 text-xs ${
                    locationMessage.startsWith('Map centered')
                      ? 'text-status-success'
                      : 'text-status-warning'
                  }`}
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {locationMessage}
                </p>
              )}
            </section>

            <section
              aria-live="polite"
              aria-busy={loading}
              className="min-h-32 flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Query results</h2>
                {response && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-success/10 px-2.5 py-1 text-xs font-medium text-status-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {resultCount} found
                  </span>
                )}
              </div>

              {loading && (
                <div className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{progressMessage}</p>
                    <p className="mt-1 text-xs">Waiting for the backend response; no results are assumed before it returns.</p>
                  </div>
                </div>
              )}

              {!loading && errorMessage && (
                <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-status-error/25 bg-status-error/5 p-3 text-sm text-status-error">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {!loading && response && detections.length === 0 && (
                <div className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>The service returned no detections for this query. The map has not been moved to a result location.</p>
                </div>
              )}

              {!loading && response && detections.length > 0 && (
                <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {detections.map((detection, index) => {
                    const coordinates = getResultCoordinates(detection);
                    const content = (
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-left text-sm font-medium">
                            {detection.name || detection.detection_class || detection.type || `Result ${index + 1}`}
                          </h3>
                          {typeof detection.confidence === 'number' && (
                            <p className="mt-1 text-left text-xs text-muted-foreground">
                              Service confidence: {(detection.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                          {coordinates && (
                            <p className="mt-1 text-left font-mono text-xs text-muted-foreground">
                              {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}
                            </p>
                          )}
                          {!coordinates && (
                            <p className="mt-1 text-left text-xs text-muted-foreground">
                              No valid coordinates were returned for this result.
                            </p>
                          )}
                        </div>
                      </div>
                    );

                    return coordinates ? (
                      <button
                        key={`${detection.tile_id || detection.id || 'result'}-${index}`}
                        type="button"
                        onClick={() => setSelectedDetection(detection)}
                        className="block w-full rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Focus map on ${detection.name || detection.detection_class || `result ${index + 1}`}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <article
                        key={`${detection.tile_id || detection.id || 'result'}-${index}`}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        {content}
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && !response && !errorMessage && (
                <div className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Submit a query to see results returned by the DISHA search service.</p>
                </div>
              )}

              {response?.insights && (
                <p className="mt-4 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
                  {response.insights}
                </p>
              )}
            </section>
          </section>

          <section className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:h-[calc(100dvh-260px)] xl:min-h-[500px] xl:max-h-[820px]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Pune map</h2>
                <p className="text-xs text-muted-foreground">
                  Map focus changes only for returned result coordinates or your requested location.
                </p>
              </div>
              {response?.processing_time_ms != null && (
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {response.processing_time_ms} ms
                </span>
              )}
            </div>
            <div className="flex h-[420px] flex-none flex-col xl:h-full xl:min-h-[500px] xl:flex-1">
              <MapView focusLocation={focusLocation} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default QueryPage;
