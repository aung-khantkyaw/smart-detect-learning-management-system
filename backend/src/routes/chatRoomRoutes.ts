import { Router } from "express";
import { getAcademicChatRoomById, getAllAcademicChatRooms, getAllCourseChatRooms, getCourseChatRoomById } from "../controllers/chatRoomCongroller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
    res.send("Chat Room");
});
router.get("/academic", authenticateToken, getAllAcademicChatRooms);
router.get("/course", authenticateToken, getAllCourseChatRooms);
router.get("/academic/:id", authenticateToken, getAcademicChatRoomById);
router.get("/course/:id", authenticateToken, getCourseChatRoomById);

export default router;