import { Router } from 'express';
import {
  createAnnouncement,
  listAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { authenticateToken, requireAdminOrTeacher } from '../middleware/auth';

const router = Router();

// Everyone (authenticated) can view
router.get('/', authenticateToken, listAnnouncements);
router.get('/:id', authenticateToken, getAnnouncementById);

// Only Admin or Teacher can create/update/delete
router.post('/', authenticateToken, requireAdminOrTeacher, createAnnouncement);
router.put('/:id', authenticateToken, requireAdminOrTeacher, updateAnnouncement);
router.delete('/:id', authenticateToken, requireAdminOrTeacher, deleteAnnouncement);

export default router;
