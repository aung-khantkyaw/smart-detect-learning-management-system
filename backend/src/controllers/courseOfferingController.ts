import type { Request, Response } from 'express';
import { db } from '../db';
import { courseChatRooms, courseOfferings } from './../db/schema';
import { eq, and } from "drizzle-orm";

export const getAllCourseOfferings = async (req: Request, res: Response) => {
    try {
        const allCourseOfferings = await db.select().from(courseOfferings);
        res.status(200).send({ status: 'success', data: allCourseOfferings });
    } catch (error) {
        console.error('Error fetching course offerings:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getCourseOfferingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const courseOffering = await db.select().from(courseOfferings).where(eq(courseOfferings.id, id));

        if (courseOffering.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Course Offering not found' });
        }

        res.status(200).send({ status: 'success', data: courseOffering[0] });
    } catch (error) {
        console.error('Error fetching course offering:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createCourseOffering = async (req: Request, res: Response) => {
    const { courseId, academicYearId, teacherId } = req.body;

    try {
        const existingOffering = await db.select().from(courseOfferings).where(and(eq(courseOfferings.courseId, courseId), eq(courseOfferings.academicYearId, academicYearId), eq(courseOfferings.teacherId, teacherId)));
        if (existingOffering.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Course offering already exists' });
        }

        const courseOffering = { courseId, academicYearId, teacherId };

        const newCourseOffering = await db.insert(courseOfferings).values(courseOffering).returning();

        const newChatRoom = await db.select().from(courseChatRooms).where(eq(courseChatRooms.offeringId, newCourseOffering[0].id));

        const updateCourseOffering = await db.update(courseOfferings)
            .set({ roomChatId: newChatRoom[0].id })
            .where(eq(courseOfferings.id, newCourseOffering[0].id))
            .returning();

        res.status(201).send({ status: 'success', data: updateCourseOffering[0], chatRoom: newChatRoom[0], message: `${newChatRoom[0]?.name ?? ''} chat room created successfully` });
    } catch (error) {
        console.error('Error creating course offering:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateCourseOffering = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { courseId, academicYearId, teacherId } = req.body;

    try {
        const existingOffering = await db.select().from(courseOfferings).where(and(eq(courseOfferings.courseId, courseId), eq(courseOfferings.academicYearId, academicYearId), eq(courseOfferings.teacherId, teacherId), eq(courseOfferings.id, id)));
        if (existingOffering.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Course offering already exists' });
        }

        const courseOffering = { courseId, academicYearId, teacherId };

        const updatedCourseOffering = await db.update(courseOfferings).set(courseOffering).where(eq(courseOfferings.id, id)).returning();

        res.status(200).send({ status: 'success', data: updatedCourseOffering[0] });
    } catch (error) {
        console.error('Error updating course offering:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteCourseOffering = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedCourseOffering = await db.delete(courseOfferings)
            .where(eq(courseOfferings.id, id))
            .returning();

        if (deletedCourseOffering.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Course Offering not found' });
        }

        res.status(200).send({ status: 'success', message: 'Course Offering deleted successfully. Chat group deleted successfully.' });
    } catch (error) {
        console.error('Error deleting course offering:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};