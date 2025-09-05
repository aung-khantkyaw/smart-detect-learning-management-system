// Simple in-memory cache metrics (resets on process restart)
export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  lastReset: string;
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  lastReset: new Date().toISOString(),
};

export function recordHit() { metrics.hits++; }
export function recordMiss() { metrics.misses++; }
export function recordSet() { metrics.sets++; }
export function recordDelete(count = 1) { metrics.deletes += count; }

export function getMetrics() {
  return { ...metrics, hitRatio: (metrics.hits + metrics.misses) ? +(metrics.hits / (metrics.hits + metrics.misses)).toFixed(4) : 0 };
}

export function resetMetrics() {
  metrics.hits = 0;
  metrics.misses = 0;
  metrics.sets = 0;
  metrics.deletes = 0;
  metrics.lastReset = new Date().toISOString();
}
