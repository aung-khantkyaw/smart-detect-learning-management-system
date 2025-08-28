import { Router } from 'express';
import { materialUpload } from '../middleware/materialUpload';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  downloadMaterial
} from '../controllers/materialController';
import { authenticateToken, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();


// All routes require authentication
router.use(authenticateToken);

// Get all materials for a course offering
router.get('/offering/:offeringId', getMaterials);

// Get a single material
router.get('/:id', getMaterial);

// Create a new material (supports optional file upload under field name "file")
router.post('/offering/:offeringId', requireAdminOrTeacher, materialUpload.single('file'), createMaterial);

// Update a material (supports optional file upload under field name "file")
router.put('/:id', requireAdminOrTeacher, materialUpload.single('file'), updateMaterial);

// Delete a material
router.delete('/:id', requireAdminOrTeacher, deleteMaterial);

// Download a material file (forces attachment)
router.get('/:id/download', authenticateToken, downloadMaterial);

export default router;
