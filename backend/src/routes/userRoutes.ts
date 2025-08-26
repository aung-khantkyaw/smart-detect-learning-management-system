import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, banUser, getOfferingCoursesByTeacherId, getAllStudents, getAllTeachers, getEnrollmentByStudentId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, requireAdminOrSelf, updateUser);
router.patch('/:id/activate', authenticateToken, requireAdmin, banUser);

export default router;
