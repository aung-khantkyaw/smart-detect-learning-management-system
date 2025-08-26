import { Router } from "express";
import { getAcademicChatRoomById, getAcademicChatRoomMembers, getAllAcademicChatRooms, getAllCourseChatRooms, getCourseChatRoomById, getCourseChatRoomMembers } from "../controllers/chatRoomCongroller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
    res.send("Chat Room");
});
router.get("/academic", authenticateToken, getAllAcademicChatRooms);
router.get("/academic/:id", authenticateToken, getAcademicChatRoomById);
router.get("/academic/:id/members", authenticateToken, getAcademicChatRoomMembers);

router.get("/course", authenticateToken, getAllCourseChatRooms);
router.get("/course/:id", authenticateToken, getCourseChatRoomById);
router.get("/course/:id/members", authenticateToken, getCourseChatRoomMembers);

export default router;