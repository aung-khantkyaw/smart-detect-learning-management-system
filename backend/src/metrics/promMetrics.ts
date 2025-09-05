import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';
import { getMetrics as getCacheMetrics } from '../cache/cacheMetrics';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Default metrics (process, GC, etc.)
if (process.env.METRICS_DISABLE_DEFAULTS !== '1') {
  client.collectDefaultMetrics({ register, prefix: process.env.METRICS_PREFIX || 'sdlms_' });
}

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 1, 2, 5]
});

export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total count of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const cacheHitCounter = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits'
});
export const cacheMissCounter = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses'
});
export const cacheSetCounter = new client.Counter({
  name: 'cache_sets_total',
  help: 'Total cache sets'
});
export const cacheDeleteCounter = new client.Counter({
  name: 'cache_deletes_total',
  help: 'Total cache deletions (keys or patterns)'
});

// Bridge in-memory cache metrics snapshot as gauges for current run
const cacheHitRatioGauge = new client.Gauge({
  name: 'cache_hit_ratio',
  help: 'Application-level cache hit ratio (hits / (hits + misses))'
});
const cacheLastResetGauge = new client.Gauge({
  name: 'cache_last_reset_timestamp',
  help: 'Unix timestamp (seconds) of last cache metrics reset'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);
register.registerMetric(cacheHitCounter);
register.registerMetric(cacheMissCounter);
register.registerMetric(cacheSetCounter);
register.registerMetric(cacheDeleteCounter);
register.registerMetric(cacheHitRatioGauge);
register.registerMetric(cacheLastResetGauge);

// Middleware to time requests
export function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {
  const startHr = process.hrtime.bigint();
  const route = (req.route && req.route.path) || req.path || 'unknown';
  res.on('finish', () => {
    const diff = Number(process.hrtime.bigint() - startHr) / 1e9; // seconds
    const labels = { method: req.method, route, status_code: String(res.statusCode) } as const;
    httpRequestDuration.observe(labels, diff);
    httpRequestCounter.inc(labels);
  });
  next();
}

// Function to update cache gauges from current snapshot periodically
export function updateCacheGauges() {
  const snap = getCacheMetrics();
  if (snap) {
    cacheHitRatioGauge.set(snap.hitRatio);
    const ts = Date.parse(snap.lastReset);
    if (!isNaN(ts)) cacheLastResetGauge.set(Math.floor(ts / 1000));
  }
}

// Schedule periodic gauge refresh
const intervalMs = Number(process.env.METRICS_CACHE_REFRESH_MS || 10000);
setInterval(updateCacheGauges, intervalMs).unref();

export async function metricsHandler(req: Request, res: Response) {
  try {
    res.set('Content-Type', register.contentType);
    // Always refresh gauges before serving
    updateCacheGauges();
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
}

// Helper functions controllers can call when cache events happen
export const cacheMetricsBridge = {
  hit: () => cacheHitCounter.inc(),
  miss: () => cacheMissCounter.inc(),
  set: () => cacheSetCounter.inc(),
  del: (count = 1) => cacheDeleteCounter.inc(count)
};
