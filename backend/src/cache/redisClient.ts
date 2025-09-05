// @ts-ignore - types may not be installed for ioredis
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { recordHit, recordMiss, recordSet, recordDelete } from './cacheMetrics';
// Optional Prometheus bridge (lazy to avoid hard dependency if prom-client not loaded yet)
let promBridge: any = null;
try {
  // Dynamically require to prevent circular or missing module issues during initial install
  const { cacheMetricsBridge } = require('../metrics/promMetrics');
  promBridge = cacheMetricsBridge;
} catch (_) {}

dotenv.config();

// Build candidate URLs (for host and docker compose bridging cases)
const primaryUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;
const fallbackUrls: string[] = [];
// If primary uses a container hostname, push localhost fallbacks
if (/sdlms-redis|redis|^redis:\/\/[^1]/.test(primaryUrl) && !primaryUrl.includes('127.0.0.1')) {
  const port = process.env.REDIS_PORT || '6379';
  fallbackUrls.push(`redis://127.0.0.1:${port}`);
  fallbackUrls.push(`redis://localhost:${port}`);
}

let connected = false;
let redisInstance: any;

function createClient(url: string) {
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on('connect', () => {
    connected = true;
    console.log('✅ Redis connected:', url);
  });
  client.on('error', (err: any) => {
    console.error('❌ Redis error', err?.code || '', err?.message || err);
    if (!connected && (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED')) {
      const next = fallbackUrls.shift();
      if (next) {
        console.log(`🔁 Retrying Redis with fallback: ${next}`);
        redisInstance = createClient(next);
      } else {
        console.warn('⚠️ No more Redis fallback URLs to try. Check REDIS_HOST/REDIS_URL env.');
      }
    }
  });
  return client;
}

redisInstance = createClient(primaryUrl);

export const redis = redisInstance;

export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) { 
      recordMiss(); 
      if (promBridge) promBridge.miss();
      if (process.env.CACHE_LOG) console.log('[CACHE MISS]', key); 
      return null; 
    }
    recordHit();
    if (promBridge) promBridge.hit();
    if (process.env.CACHE_LOG) console.log('[CACHE HIT]', key);
    return JSON.parse(raw) as T;
  } catch (e) {
  recordMiss();
  if (promBridge) promBridge.miss();
    console.error('Redis get error', e);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 60): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  recordSet();
  if (promBridge) promBridge.set();
    if (process.env.CACHE_LOG) console.log('[CACHE SET]', key, `ttl=${ttlSeconds}`);
  } catch (e) {
    console.error('Redis set error', e);
  }
}

export async function delCache(patternOrKey: string) {
  try {
    if (patternOrKey.includes('*')) {
      const stream = redis.scanStream({ match: patternOrKey });
      const keys: string[] = [];
      for await (const resultKeys of stream) {
        for (const k of resultKeys) keys.push(k);
      }
      if (keys.length) {
        await redis.del(keys);
  recordDelete(keys.length);
  if (promBridge) promBridge.del(keys.length);
        if (process.env.CACHE_LOG) console.log('[CACHE DEL][PATTERN]', patternOrKey, 'count=', keys.length);
      }
    } else {
      const res = await redis.del(patternOrKey);
      if (res) { 
        recordDelete(res);
        if (promBridge) promBridge.del(res);
      }
      if (process.env.CACHE_LOG) console.log('[CACHE DEL][KEY]', patternOrKey, 'deleted=', res);
    }
  } catch (e) {
    console.error('Redis del error', e);
  }
}
