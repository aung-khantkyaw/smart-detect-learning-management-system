import type { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.json({ status: 'success', data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAllStudentsByAcademicYear = async (req: Request, res: Response) => {
  const { academicYearId } = req.params;

  try {
    const students = await db.select().from(users).where(eq(users.academic_year_id, academicYearId));
    res.json({ status: 'success', data: students });
  } catch (error) {
    console.error('Error fetching students by academic year:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const updateUser = {
      username: user[0].email.split('@')[0],
      email: req.body.email || user[0].email,
      role: req.body.role || user[0].role,
      fullName: req.body.fullName || user[0].fullName,

      department_id: req.body.department_id || user[0].department_id,
      position_id: req.body.position_id || user[0].position_id,

      major_id: req.body.major_id || user[0].major_id,
      academic_year_id: req.body.academic_year_id || user[0].academic_year_id,
      studentNumber: req.body.studentNumber || user[0].studentNumber,
    };

    const updatedUser = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const banUser = await db.update(users).set({ isActive: false }).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User banned successfully', data: banUser });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
