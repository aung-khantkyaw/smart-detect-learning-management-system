import type { Request, Response } from 'express';
import { db } from '../db';
import { enrollments, users, courseOfferings, courses } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllEnrollments = async (req: Request, res: Response) => {
    try {
        const allEnrollments = await db.select().from(enrollments);
        return res.status(200).json({ status: "success", data: allEnrollments });
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, id));

        if (!enrollment) {
            return res.status(404).json({ status: "error", message: "Enrollment not found" });
        }

        const studentInfo = await db.select().from(users).where(eq(users.id, enrollment[0].studentId));
        const offeringInfo = await db.select().from(courseOfferings).where(eq(courseOfferings.id, enrollment[0].offeringId));
        const courseInfo = await db.select().from(courses).where(eq(courses.id, offeringInfo[0].courseId));
        const academicYearInfo = await db.select().from(courseOfferings).where(eq(courseOfferings.id, enrollment[0].offeringId));
        const teacherInfo = await db.select().from(users).where(eq(users.id, offeringInfo[0].teacherId));

        return res.status(200).json({ status: "success", data: enrollment, offering: offeringInfo, student: studentInfo, teacher: teacherInfo, course: courseInfo, academicYear: academicYearInfo });
    } catch (error) {
        console.error("Error fetching enrollment:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const createEnrollment = async (req: Request, res: Response) => {
    const { studentIds, offeringId } = req.body;

    try {
        const newEnrollments = await db.insert(enrollments).values(
            studentIds.map((studentId: string) => ({ studentId, offeringId }))
        ).returning();

        return res.status(201).json({ status: "success", data: newEnrollments });
    } catch (error) {
        console.error("Error creating enrollment:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const updateEnrollment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId, offeringId } = req.body;

    try {
        const updatedEnrollment = await db.update(enrollments)
            .set({ studentId, offeringId })
            .where(eq(enrollments.id, id))
            .returning();

        if (updatedEnrollment.length === 0) {
            return res.status(404).json({ status: "error", message: "Enrollment not found" });
        }

        return res.status(200).json({ status: "success", data: updatedEnrollment[0] });
    } catch (error) {
        console.error("Error updating enrollment:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedEnrollment = await db.delete(enrollments).where(eq(enrollments.id, id)).returning();

        if (deletedEnrollment.length === 0) {
            return res.status(404).json({ status: "error", message: "Enrollment not found" });
        }

        return res.status(200).json({ status: "success", message: "Enrollment deleted successfully" });
    } catch (error) {
        console.error("Error deleting enrollment:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

