import { Router } from 'express';
import {  getOfferingCoursesByTeacherId, getAllTeachers, getCourseChatRoomsByTeacherId } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllTeachers);
router.get('/:id/course-offerings', authenticateToken, requireAdminOrTeacher, getOfferingCoursesByTeacherId);
router.get('/:id/course-chat-rooms', authenticateToken, requireAdminOrSelf, getCourseChatRoomsByTeacherId);

export default router;
