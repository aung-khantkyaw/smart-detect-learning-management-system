import { Router } from 'express';
import { register } from '../metrics/promMetrics';
import { getMetrics as getCacheMetrics } from '../cache/cacheMetrics';

const router = Router();

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
          const key = `${row.labels.method}|${row.labels.status_code}`;
            requests[key] = Number(row.value);
        }
      });
    }
  const cache = getCacheMetrics();
    res.json({
      timestamp: Date.now(),
      http: {
        latency: httpHist,
        requests
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
 .ok{color:#4ade80}.warn{color:#fbbf24}.bad{color:#f87171}
 a{color:#60a5fa;text-decoration:none}
 footer{margin-top:1rem;font-size:0.7rem;opacity:.6;text-align:center}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head><body>
<h1>SDLMS Live Metrics <small style="font-weight:400;font-size:.8rem">(auto-refresh)</small></h1>
<div class="grid">
 <div class="card"><h3>Latency (ms)</h3><canvas id="latency"></canvas><div class="kpi" id="latencyKpi"></div></div>
 <div class="card"><h3>Request Rate</h3><canvas id="rps"></canvas><div class="kpi" id="rpsKpi"></div></div>
 <div class="card"><h3>Cache</h3><canvas id="cache"></canvas><div class="kpi" id="cacheKpi"></div></div>
 <div class="card"><h3>Memory (MB)</h3><canvas id="mem"></canvas><div class="kpi" id="memKpi"></div></div>
 <div class="card"><h3>Event Loop Lag P99 (ms)</h3><canvas id="lag"></canvas><div class="kpi" id="lagKpi"></div></div>
</div>
<footer>Data source: <code>/metrics</code> & <code>/metrics/json</code>. Refresh interval 5s.</footer>
<script>
const charts={};
function lineConfig(label,color){return{type:'line',data:{labels:[],datasets:[{label,color,borderColor:color,backgroundColor:color+'55',data:[],tension:.3,fill:true,pointRadius:0}]},options:{responsive:true,animation:false,scales:{x:{ticks:{color:'#aaa'}},y:{ticks:{color:'#aaa'}}},plugins:{legend:{labels:{color:'#ddd'}}}}};}
function ensure(){charts.latency ||= new Chart(document.getElementById('latency'),{type:'line',data:{labels:[],datasets:[{label:'P50',borderColor:'#60a5fa',backgroundColor:'#60a5fa55',data:[],tension:.3,fill:false,pointRadius:0},{label:'P95',borderColor:'#fbbf24',backgroundColor:'#fbbf2455',data:[],tension:.3,fill:false,pointRadius:0},{label:'P99',borderColor:'#f87171',backgroundColor:'#f8717155',data:[],tension:.3,fill:false,pointRadius:0}]},options:{animation:false,scales:{x:{ticks:{color:'#aaa'}},y:{ticks:{color:'#aaa'}}},plugins:{legend:{labels:{color:'#ddd'}}}}});
 charts.rps ||= new Chart(document.getElementById('rps'), lineConfig('RPS','#4ade80'));
 charts.cache ||= new Chart(document.getElementById('cache'),{type:'line',data:{labels:[],datasets:[{label:'Hit Ratio %',borderColor:'#818cf8',backgroundColor:'#818cf855',data:[],tension:.3,fill:true,pointRadius:0}]},options:{animation:false,scales:{x:{ticks:{color:'#aaa'}},y:{ticks:{color:'#aaa',callback:v=>v+'%'}}}}});
 charts.mem ||= new Chart(document.getElementById('mem'), lineConfig('RSS MB','#a855f7'));
 charts.lag ||= new Chart(document.getElementById('lag'), lineConfig('Lag P99 ms','#f472b6'));
}
let prevReq=null; let prevTs=null;
async function tick(){
 ensure();
 const res=await fetch('json');
 const j=await res.json();
 const ts=new Date(j.timestamp); const label=ts.toLocaleTimeString();
 const lat=j.http.latency||{}; const cache=j.cache; const rt=j.runtime;
 // Latency percentiles to ms
 if(lat.count){
  const p50=lat.p50*1000, p95=lat.p95*1000, p99=lat.p99*1000;
  const ds=charts.latency.data.datasets; charts.latency.data.labels.push(label);
  ds[0].data.push(p50); ds[1].data.push(p95); ds[2].data.push(p99);
  if(ds[0].data.length>50){ds.forEach(d=>d.data.shift()); charts.latency.data.labels.shift();}
  charts.latency.update();
  document.getElementById('latencyKpi').innerHTML='P50: '+p50.toFixed(1)+' ms | P95: '+p95.toFixed(1)+' ms | P99: '+p99.toFixed(1)+' ms | Count: '+lat.count;
 }
 // Requests rate
 const totalNow=Object.values(j.http.requests).reduce((a,b)=>a+b,0);
 let rps=0; if(prevReq!=null && prevTs!=null){ const dt=(j.timestamp-prevTs)/1000; rps=(totalNow-prevReq)/dt; }
 prevReq=totalNow; prevTs=j.timestamp;
 charts.rps.data.labels.push(label); charts.rps.data.datasets[0].data.push(rps);
 if(charts.rps.data.datasets[0].data.length>50){charts.rps.data.datasets[0].data.shift(); charts.rps.data.labels.shift();}
 charts.rps.update();
 const errorCount=Object.entries(j.http.requests).filter(([k])=>k.includes('|500')||k.includes('|5')).reduce((a,[,v])=>a+v,0);
 const errRate= totalNow? (errorCount/totalNow*100):0;
 document.getElementById('rpsKpi').innerHTML='RPS: '+rps.toFixed(2)+' | Errors: '+errorCount+' ('+errRate.toFixed(2)+'%)';
 // Cache hit ratio
 const hitPct= cache.hits+cache.misses? (cache.hits/(cache.hits+cache.misses)*100):0;
 charts.cache.data.labels.push(label); charts.cache.data.datasets[0].data.push(hitPct);
 if(charts.cache.data.datasets[0].data.length>50){charts.cache.data.datasets[0].data.shift(); charts.cache.data.labels.shift();}
 charts.cache.update();
 document.getElementById('cacheKpi').innerHTML='Hits: '+cache.hits+' | Misses: '+cache.misses+' | Ratio: '+hitPct.toFixed(1)+'%';
 // Memory & lag
 const rssMb = (rt.rssBytes||0)/1024/1024; const lagMs=(rt.eventLoopLagP99||0)*1000; const heapMb=(rt.heapUsedBytes||0)/1024/1024;
 charts.mem.data.labels.push(label); charts.mem.data.datasets[0].data.push(rssMb);
 if(charts.mem.data.datasets[0].data.length>50){charts.mem.data.datasets[0].data.shift(); charts.mem.data.labels.shift();}
 charts.mem.update();
 document.getElementById('memKpi').innerHTML='RSS: '+rssMb.toFixed(1)+' MB | Heap Used: '+heapMb.toFixed(1)+' MB';
 charts.lag.data.labels.push(label); charts.lag.data.datasets[0].data.push(lagMs);
 if(charts.lag.data.datasets[0].data.length>50){charts.lag.data.datasets[0].data.shift(); charts.lag.data.labels.shift();}
 charts.lag.update();
 document.getElementById('lagKpi').innerHTML='Lag P99: '+lagMs.toFixed(2)+' ms';
}
tick(); setInterval(tick,5000);
</script>
</body></html>`);
});

export default router;
