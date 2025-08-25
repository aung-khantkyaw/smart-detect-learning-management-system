import type { Request, Response } from 'express';
import { db } from '../db';
import { academicChatRooms, academicYears } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllAcademicYears = async (req: Request, res: Response) => {
    try {
        const years = await db.select().from(academicYears);
        res.json({ status: 'success', data: years });
    } catch (error) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getAcademicYearById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const year = await db.select().from(academicYears).where(eq(academicYears.id, id));

        if (year.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Academic year not found' });
        }

        res.json({ status: 'success', data: year[0] });
    } catch (error) {
        console.error('Error fetching academic year by ID:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createAcademicYear = async (req: Request, res: Response) => {
    const { name, startDate, endDate } = req.body;

    try {
        const existingYear = await db.select().from(academicYears).where(eq(academicYears.name, name));
        if (existingYear.length > 0) {
            return res.status(409).json({ status: 'error', message: 'Academic year already exists' });
        }

        const academicYear = { name, startDate, endDate };

        const newYear = await db.insert(academicYears).values(academicYear).returning();

        const newChatGroup = await db.select().from(academicChatRooms).where(eq(academicChatRooms.academicYearId, newYear[0].id));

        res.status(201).json({ status: 'success', data: newYear, chatGroup: newChatGroup, message: `${newChatGroup[0]?.name ?? ''} chat group created successfully` });
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;

    try {
        const updatedYear = await db.update(academicYears)
            .set({ name, startDate, endDate })
            .where(eq(academicYears.id, id))
            .returning();

        if (updatedYear.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Academic year not found' });
        }

        res.json({ status: 'success', data: updatedYear[0] });
    } catch (error) {
        console.error('Error updating academic year:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedYear = await db.delete(academicYears)
            .where(eq(academicYears.id, id))
            .returning();

        if (deletedYear.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Academic year not found' });
        }

        res.json({ status: 'success', message: 'Academic year deleted successfully. Chat group deleted successfully.' });
    } catch (error) {
        console.error('Error deleting academic year:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};