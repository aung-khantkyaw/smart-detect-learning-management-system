import type { Request, Response } from 'express';
import { db } from '../db';
import { majors, users } from './../db/schema';
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
        // Prevent deletion if any users/students are assigned to this major
        const hasUsers = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.majorId, id))
          .limit(1);
        if (hasUsers.length > 0) {
          return res.status(409).json({
            status: 'error',
            message:
              'Cannot delete major: one or more users/students are assigned to this major. Reassign those users first.'
          });
        }

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

export const getStudentsByMajorId = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const students = await db.select()
            .from(users)
            .where(eq(users.majorId, id));

        res.json({ status: 'success', data: students });
    } catch (error) {
        console.error('Error fetching students by major ID:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch students' });
    }
};