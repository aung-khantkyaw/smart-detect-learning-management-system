import { Request, Response } from 'express';

export const sendCourseNotification = async (req: Request, res: Response) => {
  try {
    const { courseId, message, type } = req.body;
    
    // Emit notification to all users in the course
    global.socketService.emitToCourse(courseId, 'new-notification', {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

export const broadcastAnnouncement = async (req: Request, res: Response) => {
  try {
    const { message, type } = req.body;
    
    // Broadcast to all connected users
    global.socketService.emitToAll('announcement', {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Announcement broadcasted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast announcement' });
  }
};