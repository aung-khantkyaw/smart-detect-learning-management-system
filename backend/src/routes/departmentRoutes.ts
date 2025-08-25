import { Router } from "express";
import { getAllDepartments, getDepartmentById, createDepartment, deleteDepartment, updateDepartment } from "../controllers/departmentController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllDepartments);
router.get("/:id", authenticateToken, getDepartmentById);
router.post("/", authenticateToken, requireAdmin, createDepartment);
router.put("/:id", authenticateToken, requireAdmin, updateDepartment);
router.delete("/:id", authenticateToken, requireAdmin, deleteDepartment);

export default router;