import { Router } from 'express';
import { sendCourseNotification, broadcastAnnouncement } from '../controllers/chatController';

const router = Router();

router.post('/notification', sendCourseNotification);
router.post('/announcement', broadcastAnnouncement);

export default router;