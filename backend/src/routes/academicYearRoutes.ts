import { Router } from "express";
import {
    getAllAcademicYears,
    getAcademicYearById,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    getAllStudentsByAcademicYear,
    getOfferingCoursesByAcademicYearId,
    getAcademicChatRoomByAcademicYearId
} from "../controllers/academicYearController";
import { authenticateToken, requireAdmin, requireAdminOrTeacher } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllAcademicYears);
router.get("/:id", authenticateToken, getAcademicYearById);
router.post("/", authenticateToken, requireAdmin, createAcademicYear);
router.put("/:id", authenticateToken, requireAdmin, updateAcademicYear);
router.delete("/:id", authenticateToken, requireAdmin, deleteAcademicYear);

router.get('/:academicYearId/course-offerings', authenticateToken, getOfferingCoursesByAcademicYearId);
router.get('/:academicYearId/students', authenticateToken, requireAdminOrTeacher, getAllStudentsByAcademicYear);
router.get('/:academicYearId/chat-room', authenticateToken, getAcademicChatRoomByAcademicYearId);

export default router;
