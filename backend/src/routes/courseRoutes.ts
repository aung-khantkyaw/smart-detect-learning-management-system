import { Router } from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getOfferingCoursesByCourseId
} from "../controllers/courseController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllCourses);
router.get("/:id", authenticateToken, getCourseById);
router.post("/", authenticateToken, requireAdmin, createCourse);
router.put("/:id", authenticateToken, requireAdmin, updateCourse);
router.delete("/:id", authenticateToken, requireAdmin, deleteCourse);

router.get("/:id/course-offerings", authenticateToken, requireAdmin, getOfferingCoursesByCourseId);

export default router;