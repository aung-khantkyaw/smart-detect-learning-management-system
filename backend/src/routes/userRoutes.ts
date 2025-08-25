import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, banUser, getAllStudentsByAcademicYear} from '../controllers/userController';
import { authenticateToken, requireAdmin, requireAdminOrSelf, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, requireAdminOrSelf, updateUser);
router.put('/ban-user/:id', authenticateToken, requireAdmin, banUser);
router.get('/students/academic-year/:academicYearId', authenticateToken, requireAdminOrTeacher, getAllStudentsByAcademicYear);

export default router;
