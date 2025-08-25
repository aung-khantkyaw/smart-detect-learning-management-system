import { Router } from 'express';
import {  getOfferingCoursesByTeacherId, getAllTeachers } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllTeachers);
router.get('/:teacherId/course-offerings', authenticateToken, requireAdminOrTeacher, getOfferingCoursesByTeacherId);

export default router;
