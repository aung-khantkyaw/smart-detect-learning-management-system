import { Router } from 'express';
import path from 'path';
import { register } from '../metrics/promMetrics';
import { getMetrics as getCacheMetrics } from '../cache/cacheMetrics';

const router = Router();

// Keep previous HTTP counter snapshot to compute per-key request rates (RPS)
interface HttpSnapshot { ts: number; counts: Record<string, number>; }
let prevHttpSnapshot: HttpSnapshot | null = null;

interface HistogramBucket { le: string; value: number; }

async function extractHistogramPercentiles(name: string) {
  const metricsJson: any[] = await register.getMetricsAsJSON();
  const hist = metricsJson.find(m => m.name === name);
  if (!hist || !hist.values) return null;
  const bucketRows: HistogramBucket[] = hist.values
    .filter((v: any) => v.metricName === name + '_bucket')
    .map((v: any) => ({ le: v.labels.le, value: Number(v.value) }))
  .sort((a: any, b: any) => {
      if (a.le === '+Inf') return 1;
      if (b.le === '+Inf') return -1;
      const na = Number(a.le); const nb = Number(b.le);
      if (isNaN(na) && isNaN(nb)) return 0;
      if (isNaN(na)) return 1;
      if (isNaN(nb)) return -1;
      return na - nb;
    });
  const countRow = hist.values.find((v: any) => v.metricName === name + '_count');
  const sumRow = hist.values.find((v: any) => v.metricName === name + '_sum');
  if (!countRow) return null;
  const total = Number(countRow.value) || 0;
  const sum = Number(sumRow?.value || 0);
  if (!total) return { count: 0, sum: 0, buckets: bucketRows, p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 };
  function pct(p: number) {
    const target = total * p;
    for (const b of bucketRows) {
      if (b.value >= target) {
        if (b.le === '+Inf') {
          const secondLastIndex = bucketRows.length - 2;
          return secondLastIndex >= 0 ? bucketRows[secondLastIndex].le : '0';
        }
        return b.le;
      }
    }
    const lastIndex = bucketRows.length - 1;
    return lastIndex >= 0 ? bucketRows[lastIndex].le : '0';
  }
  return {
    count: total,
    sum,
    avg: sum / total,
    buckets: bucketRows,
    p50: Number(pct(0.50)),
    p90: Number(pct(0.90)),
    p95: Number(pct(0.95)),
    p99: Number(pct(0.99))
  };
}

async function getGaugeValue(name: string) {
  const metricsJson: any[] = await register.getMetricsAsJSON();
  const metric = metricsJson.find(m => m.name === name);
  if (!metric) return null;
  const sample = metric.values.find((v: any) => v.metricName === name);
  return sample ? Number(sample.value) : null;
}

router.get('/json', async (_req, res) => {
  try {
  const httpHist = await extractHistogramPercentiles('http_request_duration_seconds');
  const metricsJson: any[] = await register.getMetricsAsJSON();
    const httpCounter = metricsJson.find(m => m.name === 'http_requests_total');
    const requests: Record<string, number> = {};
    if (httpCounter) {
      httpCounter.values.forEach((row: any) => {
        if (row.metricName === 'http_requests_total') {
          // Include route label so we can compute per-route rates client or server side
          const key = `${row.labels.method}|${row.labels.route}|${row.labels.status_code}`;
          requests[key] = Number(row.value);
        }
      });
    }
  const cache = getCacheMetrics();
    // Compute per-key rates (RPS) since last snapshot
    const now = Date.now();
    const rates: Record<string, number> = {};
    let totalRps = 0;
    if (prevHttpSnapshot) {
      const dt = (now - prevHttpSnapshot.ts) / 1000;
      if (dt > 0) {
        for (const k of Object.keys(requests)) {
          const prev = prevHttpSnapshot.counts[k] || 0;
          const cur = requests[k];
            const diff = cur - prev;
            if (diff >= 0) {
              const r = diff / dt;
              rates[k] = r;
              totalRps += r;
            }
        }
      }
    }
    prevHttpSnapshot = { ts: now, counts: requests };
    res.json({
      timestamp: Date.now(),
      http: {
        latency: httpHist,
        requests,
        rates,
        totalRps: Number(totalRps.toFixed(4))
      },
      cache,
      runtime: {
    rssBytes: await getGaugeValue('sdlms_process_resident_memory_bytes'),
    eventLoopLagP99: await getGaugeValue('sdlms_nodejs_eventloop_lag_p99_seconds'),
    heapUsedBytes: await getGaugeValue('sdlms_nodejs_heap_size_used_bytes')
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to build metrics JSON' });
  }
});

// External JS for dashboard to avoid inline script CSP issues
router.get('/chart.js', async (_req, res) => {
  try {
    // Resolve main CJS entry (allowed by exports) then derive UMD sibling file
    const mainEntry = require.resolve('chart.js'); // -> dist/chart.cjs
    const distDir = path.dirname(mainEntry); // dist
    const umdPath = path.join(distDir, 'chart.umd.js');
    const fs = await import('fs');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    fs.createReadStream(umdPath).on('error', (err) => {
      res.end(`console.error('Stream error loading Chart.js UMD: ${String(err)}');`);
    }).pipe(res);
  } catch (e) {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(`console.error('Failed to resolve Chart.js main entry: ${String(e)}');`);
  }
});

router.get('/dashboard.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.end(`(function(){
    const charts = {};
    let prevReq = null, prevTs = null, failureStreak = 0;
    function log(m){ try{ console.log('[metrics-ui]', m); }catch(_){} }
    function $(id){ return document.getElementById(id); }
    function footer(msg, err){ const f=$('statusFooter'); if(f){ f.textContent=msg; if(err) f.style.color='#f87171'; }}
    function lineConfig(label,color){ return { type:'line', data:{ labels:[], datasets:[{ label, borderColor:color, backgroundColor:color+'22', data:[], tension:.3, fill:false, pointRadius:0 }] }, options:{ animation:false, responsive:true, scales:{ x:{ ticks:{ color:'#aaa'}}, y:{ ticks:{ color:'#aaa'}}}, plugins:{ legend:{ labels:{ color:'#ddd'}}}}}; }
    function ensureCharts(){ if(!window.Chart) return false; if(!charts.latency){ charts.latency=new Chart($('latency').getContext('2d'), { type:'line', data:{ labels:[], datasets:[{label:'P50',borderColor:'#60a5fa',backgroundColor:'#60a5fa22',data:[],tension:.3,fill:false,pointRadius:0},{label:'P95',borderColor:'#fbbf24',backgroundColor:'#fbbf2422',data:[],tension:.3,fill:false,pointRadius:0},{label:'P99',borderColor:'#f87171',backgroundColor:'#f8717122',data:[],tension:.3,fill:false,pointRadius:0}]}, options:{ animation:false, scales:{ x:{ ticks:{ color:'#aaa'}}, y:{ ticks:{ color:'#aaa'}}}, plugins:{ legend:{ labels:{ color:'#ddd'}}}}}); }
      if(!charts.rps){ charts.rps=new Chart($('rps').getContext('2d'), lineConfig('RPS','#4ade80')); }
      if(!charts.cache){ charts.cache=new Chart($('cache').getContext('2d'), { type:'line', data:{ labels:[], datasets:[{label:'Hit Ratio %',borderColor:'#818cf8',backgroundColor:'#818cf855',data:[],tension:.3,fill:true,pointRadius:0}]}, options:{ animation:false, scales:{ x:{ ticks:{ color:'#aaa'}}, y:{ ticks:{ color:'#aaa', callback:v=>v+'%'}}}}}); }
      if(!charts.mem){ charts.mem=new Chart($('mem').getContext('2d'), lineConfig('RSS MB','#a855f7')); }
      if(!charts.lag){ charts.lag=new Chart($('lag').getContext('2d'), lineConfig('Lag P99 ms','#f472b6')); }
      return true;
    }
    async function poll(){
      try {
        if(!ensureCharts()){ return; }
        const res = await fetch('/metrics/json',{cache:'no-store'});
        if(!res.ok) throw new Error('HTTP '+res.status);
        const data = await res.json();
        const label = new Date(data.timestamp).toLocaleTimeString();
        const lat = data.http.latency || {}; const reqs = data.http.requests || {}; const c = data.cache || {hits:0,misses:0}; const rt = data.runtime || {};
  if(lat.count){ const p50=lat.p50*1000, p95=lat.p95*1000, p99=lat.p99*1000; const ds=charts.latency.data.datasets; charts.latency.data.labels.push(label); ds[0].data.push(p50); ds[1].data.push(p95); ds[2].data.push(p99); if(ds[0].data.length>50){ ds.forEach(d=>d.data.shift()); charts.latency.data.labels.shift(); } charts.latency.update(); $('latencyKpi').textContent='P50 '+p50.toFixed(1)+' ms | P95 '+p95.toFixed(1)+' ms | P99 '+p99.toFixed(1)+' ms | Count '+lat.count; }
        let total=0; Object.values(reqs).forEach(v=> total+=v); let rps=0; if(prevReq!=null && prevTs!=null){ const dt=(data.timestamp - prevTs)/1000; rps=(total - prevReq)/dt; } prevReq=total; prevTs=data.timestamp; const serverTotalRps = (data.http.totalRps!=null)? data.http.totalRps : rps; const effectiveRps = serverTotalRps || rps;
        charts.rps.data.labels.push(label); charts.rps.data.datasets[0].data.push(effectiveRps); if(charts.rps.data.datasets[0].data.length>50){ charts.rps.data.datasets[0].data.shift(); charts.rps.data.labels.shift(); } charts.rps.update();
  let errorCount=0; Object.keys(reqs).forEach(k=>{ if(/\|5\d\d$/.test(k)) errorCount+=reqs[k]; }); const errRate= total? (errorCount/total*100):0; $('rpsKpi').textContent='RPS '+effectiveRps.toFixed(2)+' | Errors '+errorCount+' ('+errRate.toFixed(2)+'%)';
        // Per-route RPS table (use server-provided rates if present else compute diff client-side per key)
        const rateMap = data.http.rates || {}; // keys method|route|status
  const aggregate = {};
        // If no server rates, compute naive client diff per key using reqs snapshot history we don't store (skip)
        for(const key of Object.keys(rateMap)){
          const parts = key.split('|'); if(parts.length<3) continue; const method=parts[0]; const route=parts[1]; const status=parts[2]; const r = rateMap[key]; const aggKey=method+' '+route; if(!aggregate[aggKey]) aggregate[aggKey]={ method, route, rps:0, errRps:0 }; aggregate[aggKey].rps += r; if(/^5/.test(status)) aggregate[aggKey].errRps += r; }
        const rows = Object.values(aggregate).sort((a,b)=> b.rps - a.rps).slice(0,8).map(r=> '<tr><td>'+r.method+'</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+r.route+'">'+r.route+'</td><td style="text-align:right">'+r.rps.toFixed(2)+'</td><td style="text-align:right">'+(r.rps? (r.errRps/r.rps*100).toFixed(1):'0.0')+'%</td></tr>').join('');
        const bodyEl = $('routeRatesBody'); if(bodyEl){ bodyEl.innerHTML = rows || '<tr><td colspan="4" style="text-align:center;opacity:.5">No data</td></tr>'; }
  const hitPct=(c.hits+c.misses)? (c.hits/(c.hits+c.misses)*100):0; charts.cache.data.labels.push(label); charts.cache.data.datasets[0].data.push(hitPct); if(charts.cache.data.datasets[0].data.length>50){ charts.cache.data.datasets[0].data.shift(); charts.cache.data.labels.shift(); } charts.cache.update(); $('cacheKpi').textContent='Hits '+c.hits+' | Misses '+c.misses+' | Ratio '+hitPct.toFixed(1)+'%';
  const rssMb=(rt.rssBytes||0)/1048576, heapMb=(rt.heapUsedBytes||0)/1048576, lagMs=(rt.eventLoopLagP99||0)*1000; charts.mem.data.labels.push(label); charts.mem.data.datasets[0].data.push(rssMb); if(charts.mem.data.datasets[0].data.length>50){ charts.mem.data.datasets[0].data.shift(); charts.mem.data.labels.shift(); } charts.mem.update(); $('memKpi').textContent='RSS '+rssMb.toFixed(1)+' MB | Heap '+heapMb.toFixed(1)+' MB'; charts.lag.data.labels.push(label); charts.lag.data.datasets[0].data.push(lagMs); if(charts.lag.data.datasets[0].data.length>50){ charts.lag.data.datasets[0].data.shift(); charts.lag.data.labels.shift(); } charts.lag.update(); $('lagKpi').textContent='Lag P99 '+lagMs.toFixed(2)+' ms';
        failureStreak=0; footer('Updated '+new Date().toLocaleTimeString());
      } catch(e) {
        failureStreak++; footer('Fetch failed ('+failureStreak+') '+(e&&e.message?e.message:e), true);
      }
    }
    function loop(){ poll().finally(()=> setTimeout(loop,5000)); }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loop); else loop();
  })();`);
});

router.get('/ui', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>SDLMS Metrics Dashboard</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
 body{font-family:system-ui,Arial,sans-serif;margin:0;padding:1rem;background:#0f1115;color:#eee;}
 h1{margin:0 0 1rem;font-size:1.4rem;}
 .grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}
 .card{background:#1b1f27;padding:1rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.4);} 
 canvas{width:100%;height:160px;}
 .kpi{font-size:0.85rem;line-height:1.3;}
 code{background:#222;padding:2px 4px;border-radius:4px;}
 footer{margin-top:1rem;font-size:0.7rem;opacity:.6;text-align:center}
 a{color:#60a5fa;text-decoration:none}
 .error{color:#f87171}
 table{width:100%;border-collapse:collapse;margin-top:.25rem}
 th,td{padding:2px 4px;font-weight:400}
 th{font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af}
 tbody td{font-size:.65rem;border-top:1px solid #222}
 </style>
 <script src="/metrics/chart.js" defer></script>
 <script src="/metrics/dashboard.js" defer></script>
</head><body>
<h1>SDLMS Live Metrics <small style="font-weight:400;font-size:.8rem">(auto-refresh)</small></h1>
<div class="grid">
 <div class="card"><h3>Latency (ms)</h3><canvas id="latency"></canvas><div class="kpi" id="latencyKpi"></div></div>
 <div class="card"><h3>Request Rate</h3><canvas id="rps"></canvas><div class="kpi" id="rpsKpi"></div></div>
 <div class="card"><h3>Per-Route RPS</h3><div class="kpi" style="overflow:auto;max-height:180px"><table id="routeRates"><thead><tr><th align="left">Method</th><th align="left">Route</th><th align="right">RPS</th><th align="right">Err%</th></tr></thead><tbody id="routeRatesBody"></tbody></table></div></div>
 <div class="card"><h3>Cache</h3><canvas id="cache"></canvas><div class="kpi" id="cacheKpi"></div></div>
 <div class="card"><h3>Memory (MB)</h3><canvas id="mem"></canvas><div class="kpi" id="memKpi"></div></div>
 <div class="card"><h3>Event Loop Lag P99 (ms)</h3><canvas id="lag"></canvas><div class="kpi" id="lagKpi"></div></div>
</div>
<footer id="statusFooter">Data source: <code>/metrics</code> & <code>/metrics/json</code>. Refresh interval 5s.</footer>
</body></html>`);
});

export default router;
