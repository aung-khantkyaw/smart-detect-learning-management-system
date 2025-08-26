import { Router } from "express";
import { createEnrollment, deleteEnrollment, getAllEnrollments, getEnrollmentById, updateEnrollment } from "../controllers/enrollmentController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get('/', authenticateToken, getAllEnrollments);
router.get('/:id', authenticateToken, getEnrollmentById);
router.post('/', authenticateToken, requireAdmin, createEnrollment);
router.put('/:id', authenticateToken, requireAdmin, updateEnrollment);
router.delete('/:id', authenticateToken, requireAdmin, deleteEnrollment);

export default router;