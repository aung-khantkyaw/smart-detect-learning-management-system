import { Router } from "express";
import { getAllDepartments, getDepartmentById, createDepartment, deleteDepartment, updateDepartment, getCourseByDepartmentId, getTeacherByDepartmentId } from "../controllers/departmentController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllDepartments);
router.get("/:id", authenticateToken, getDepartmentById);
router.post("/", authenticateToken, requireAdmin, createDepartment);
router.put("/:id", authenticateToken, requireAdmin, updateDepartment);
router.delete("/:id", authenticateToken, requireAdmin, deleteDepartment);

router.get("/:departmentId/courses", authenticateToken, getCourseByDepartmentId);
router.get("/:departmentId/teachers", authenticateToken, getTeacherByDepartmentId);

export default router;