import { Router } from 'express';
import { getAllStudents, getEnrollmentByStudentId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllStudents);
router.get('/:studentId/enrollments', authenticateToken, requireAdminOrTeacher, getEnrollmentByStudentId);

export default router;
