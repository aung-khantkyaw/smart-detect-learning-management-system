import type { Request, Response } from 'express';
import { db } from '../db';
import { majors } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllMajors = async (req: Request, res: Response) => {
  try {
    const allMajors = await db.select().from(majors);
    res.json({ status: 'success', data: allMajors });
  } catch (error) {
    console.error('Error fetching majors:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch majors' });
  }
};

export const getMajorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const major = await db.select().from(majors).where(eq(majors.id, id)).limit(1);
    if (major.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Major not found' });
    }
    res.json({ status: 'success', data: major[0] });
  } catch (error) {
    console.error('Error fetching major by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch major' });
  }
};

export const createMajor = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const major = {
      name,
    };

    const newMajor = await db.insert(majors).values(major).returning();
    return res.status(201).json({ status: 'success', data: newMajor });
  } catch (error) {
    console.error('Error creating major:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateMajor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedMajor = await db.update(majors)
      .set({ name })
      .where(eq(majors.id, id))
      .returning();

    if (updatedMajor.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Major not found' });
    }

    res.json({ status: 'success', data: updatedMajor[0] });
  } catch (error) {
    console.error('Error updating major:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update major' });
  }
};

export const deleteMajor = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedMajor = await db.delete(majors).where(eq(majors.id, id)).returning();

        if (deletedMajor.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Major not found' });
        }

        res.json({ status: 'success', message: 'Major deleted successfully' });
    } catch (error) {
        console.error('Error deleting major:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete major' });
    }
};