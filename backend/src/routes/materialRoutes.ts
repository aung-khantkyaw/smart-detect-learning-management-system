import { Router } from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../controllers/materialController';
import { authenticateToken, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all materials for a course offering
router.get('/offering/:offeringId', getMaterials);

// Get a single material
router.get('/:id', getMaterial);

// Create a new material
router.post('/offering/:offeringId', requireAdminOrTeacher, createMaterial);

// Update a material
router.put('/:id', requireAdminOrTeacher, updateMaterial);

// Delete a material
router.delete('/:id', requireAdminOrTeacher, deleteMaterial);

export default router;
