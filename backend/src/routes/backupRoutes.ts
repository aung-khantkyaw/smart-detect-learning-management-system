import express from 'express';
import { getBackups, restoreBackup } from '../controllers/backupController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require a valid JWT first
router.use(authenticateToken);

// Admin-only endpoints
router.get('/backups', requireAdmin, getBackups);
router.post('/restore-backup', requireAdmin, restoreBackup);

export default router;