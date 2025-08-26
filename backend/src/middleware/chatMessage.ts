import { Request, Response, NextFunction } from 'express';
import { getMulterUpload } from "../utils/multerUpload";

interface ChatMessage {
  roomId: string;
  roomType: 'ACADEMIC' | 'COURSE';
  senderId: string;
  message?: string;
  fileUrl?: string;
}

// Multer middleware for file uploads
export const fileUploadMiddleware = getMulterUpload("chat").single("file");

// Validation middleware for chat message data
export const validateChatMessage = (req: Request, res: Response, next: NextFunction) => {
  const { roomId, roomType, senderId, message } = req.body;
  const file = req.file;

  // Check if required fields are present
  if (!roomId || !roomType || !senderId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: roomId, roomType, and senderId are required"
    });
  }

  // Validate roomType
  if (!['ACADEMIC', 'COURSE'].includes(roomType)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid roomType. Must be either 'ACADEMIC' or 'COURSE'"
    });
  }

  // Ensure either message or file is provided
  if (!message && !file) {
    return res.status(400).json({
      status: "error",
      message: "Either message text or file must be provided"
    });
  }

  // Validate file size if file is present (10MB limit)
  if (file && file.size > 10 * 1024 * 1024) {
    return res.status(400).json({
      status: "error",
      message: "File size must be less than 10MB"
    });
  }

  next();
};