import { Router } from "express";
import {
    getAllCourseOfferings,
    getCourseOfferingById,
    createCourseOffering,
    updateCourseOffering,    
    deleteCourseOffering
} from "../controllers/courseOfferingController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllCourseOfferings);
router.get("/:id", authenticateToken, getCourseOfferingById);
router.post("/", authenticateToken, requireAdmin, createCourseOffering);
router.put("/:id", authenticateToken, requireAdmin, updateCourseOffering);
router.delete("/:id", authenticateToken, requireAdmin, deleteCourseOffering);

export default router;