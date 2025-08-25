import { Router } from "express";
import {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  getTeacherByPositionId,
} from "../controllers/positionController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllPositions);
router.get("/:id", authenticateToken, getPositionById);
router.post("/", authenticateToken, requireAdmin, createPosition);
router.put("/:id", authenticateToken, requireAdmin, updatePosition);
router.delete("/:id", authenticateToken, requireAdmin, deletePosition);

router.get("/:positionId/teachers", authenticateToken, getTeacherByPositionId);

export default router;
