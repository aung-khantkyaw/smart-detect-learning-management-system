import { Router } from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} from "../controllers/courseController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllCourses);
router.get("/:id", authenticateToken, getCourseById);
router.post("/", authenticateToken, requireAdmin, createCourse);
router.put("/:id", authenticateToken, requireAdmin, updateCourse);
router.delete("/:id", authenticateToken, requireAdmin, deleteCourse);

export default router;