import { Router } from "express";
import {
    getAllAcademicYears,
    getAcademicYearById,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear
} from "../controllers/academicYearController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllAcademicYears);
router.get("/:id", authenticateToken, getAcademicYearById);
router.post("/", authenticateToken, requireAdmin, createAcademicYear);
router.put("/:id", authenticateToken, requireAdmin, updateAcademicYear);
router.delete("/:id", authenticateToken, requireAdmin, deleteAcademicYear);

export default router;
