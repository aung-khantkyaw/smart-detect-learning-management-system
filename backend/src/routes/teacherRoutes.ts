import { Router } from 'express';
import {  getOfferingCoursesByTeacherId, getAllTeachers, getCourseChatRoomsByTeacherId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllTeachers);
router.get('/:teacherId/course-offerings', authenticateToken, requireAdminOrTeacher, getOfferingCoursesByTeacherId);
router.get('/:teacherId/course-chat-rooms', authenticateToken, requireAdminOrSelf, getCourseChatRoomsByTeacherId);

export default router;
