import { Router } from "express";
import { getAllChatRooms, getAcademicChatRoomById, getAcademicChatRoomMembers, getAllAcademicChatRooms, getAllCourseChatRooms, getCourseChatRoomById, getCourseChatRoomMembers, sendMessage, getChatMessages, deleteMessage, downloadChatFile } from "../controllers/chatRoomCongroller";
import { authenticateToken } from "../middleware/auth";
import { fileUploadMiddleware, validateChatMessage } from "../middleware/chatMessage";

const router = Router();

router.get("/", authenticateToken, getAllChatRooms);
router.get("/academic", authenticateToken, getAllAcademicChatRooms);
router.get("/academic/:id", authenticateToken, getAcademicChatRoomById);
router.get("/academic/:id/members", authenticateToken, getAcademicChatRoomMembers);

router.get("/course", authenticateToken, getAllCourseChatRooms);
router.get("/course/:id", authenticateToken, getCourseChatRoomById);
router.get("/course/:id/members", authenticateToken, getCourseChatRoomMembers);

// Message routes
router.get("/:roomType/:roomId/messages", authenticateToken, getChatMessages);
router.post("/send-message", authenticateToken, fileUploadMiddleware, validateChatMessage, sendMessage);
router.delete("/messages/:messageId", authenticateToken, deleteMessage);
router.get("/messages/:messageId/download", authenticateToken, downloadChatFile);

export default router;