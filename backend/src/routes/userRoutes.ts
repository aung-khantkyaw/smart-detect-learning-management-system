import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, banUser, getOfferingCoursesByTeacherId, getAllStudents, getAllTeachers, getEnrollmentByStudentId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, requireAdminOrSelf, updateUser);
router.patch('/:id/activate', authenticateToken, requireAdmin, banUser);

router.get('/students', authenticateToken, requireAdmin, getAllStudents);
router.get('/students/:studentId/enrollments', authenticateToken, requireAdmin, getEnrollmentByStudentId);
router.get('/teachers', authenticateToken, requireAdmin, getAllTeachers);
router.get('/teachers/:teacherId/course-offerings', authenticateToken, requireAdmin, getOfferingCoursesByTeacherId);

export default router;
