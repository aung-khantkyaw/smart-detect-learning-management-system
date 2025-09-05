import { Router } from 'express';
import { getMetrics, resetMetrics } from '../cache/cacheMetrics';

const router = Router();

router.get('/metrics', (req, res) => {
  res.json({ status: 'success', data: getMetrics() });
});

router.post('/metrics/reset', (req, res) => {
  resetMetrics();
  res.json({ status: 'success', message: 'Cache metrics reset' });
});

export default router;
