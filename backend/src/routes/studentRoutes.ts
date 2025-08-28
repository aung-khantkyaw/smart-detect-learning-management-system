import { Router } from 'express';
import { getAcademicChatRoomByStudentId, getAllStudents, getCourseChatRoomsByStudentId, getEnrollmentByStudentId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllStudents);
router.get('/:id/enrollments', authenticateToken, requireAdminOrSelf, getEnrollmentByStudentId);
router.get('/:id/course-chat-rooms', authenticateToken, requireAdminOrSelf, getCourseChatRoomsByStudentId);
router.get('/:id/academic-chat-rooms', authenticateToken, requireAdminOrSelf, getAcademicChatRoomByStudentId);

export default router;
