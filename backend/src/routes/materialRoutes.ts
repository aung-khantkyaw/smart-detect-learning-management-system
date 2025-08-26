import { Router } from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../controllers/materialController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all materials for a course offering
router.get('/offering/:offeringId', getMaterials);

// Get a single material
router.get('/:id', getMaterial);

// Create a new material
router.post('/offering/:offeringId', createMaterial);

// Update a material
router.put('/:id', updateMaterial);

// Delete a material
router.delete('/:id', deleteMaterial);

export default router;
