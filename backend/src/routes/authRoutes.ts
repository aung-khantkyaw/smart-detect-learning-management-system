import { Router } from 'express';
import { registrationUser, loginUser, main, logoutUser, deleteUser } from '../controllers/authController';
import { authenticateToken, requireAdmin, requireAdminOrSelf } from '../middleware/auth';

const router = Router();

router.get('/test-auth', main);
router.post('/register', authenticateToken, requireAdmin, registrationUser);
router.post('/login', loginUser);
router.post('/logout', authenticateToken, logoutUser);
router.delete('/delete', authenticateToken, requireAdminOrSelf, deleteUser);

export default router;
