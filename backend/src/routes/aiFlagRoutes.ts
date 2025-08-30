import { Router } from 'express';
import { getUserAiFlags } from '../controllers/aiFlagController';

const router = Router();

// Get all AI flags and total for a user
// GET /api/ai-flag/:id
router.get('/:id', getUserAiFlags);

export default router;
