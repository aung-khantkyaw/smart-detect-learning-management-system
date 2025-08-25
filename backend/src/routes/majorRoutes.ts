import { Router } from "express";
import {
    getAllMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor,
    getStudentsByMajorId,
} from "../controllers/majorController";
import { authenticateToken, requireAdmin, requireAdminOrTeacher } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllMajors);
router.get("/:id", authenticateToken, getMajorById);
router.post("/", authenticateToken, requireAdmin, createMajor);
router.put("/:id", authenticateToken, requireAdmin, updateMajor);
router.delete("/:id", authenticateToken, requireAdmin, deleteMajor);

router.get("/:id/students", authenticateToken, requireAdminOrTeacher, getStudentsByMajorId);

export default router;