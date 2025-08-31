import express from 'express';
import { getBackups, restoreBackup } from '../controllers/backupController';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/backups', requireAdmin, getBackups);
router.post('/restore-backup', requireAdmin, restoreBackup);

export default router;