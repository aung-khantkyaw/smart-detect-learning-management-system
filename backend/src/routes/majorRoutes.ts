import { Router } from "express";
import {
    getAllMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor,
} from "../controllers/majorController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllMajors);
router.get("/:id", authenticateToken, getMajorById);
router.post("/", authenticateToken, requireAdmin, createMajor);
router.put("/:id", authenticateToken, requireAdmin, updateMajor);
router.delete("/:id", authenticateToken, requireAdmin, deleteMajor);

export default router;