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
  const { id } = req.params;
  
  try {
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

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, role, fullName, department_id, position_id, major_id, academic_year_id, studentNumber } = req.body;
  
  try {
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const updateUser = {
      username: user[0].email.split('@')[0],
      email: email || user[0].email,
      role: role || user[0].role,
      fullName: fullName || user[0].fullName,

      departmentId: department_id || user[0].departmentId,
      positionId: position_id || user[0].positionId,

      majorId: major_id || user[0].majorId,
      academicYearId: academic_year_id || user[0].academicYearId,
      studentNumber: studentNumber || user[0].studentNumber,
    };

    const updatedUser = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isActive = user[0].isActive ? false : true;

    const banUser = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User banned successfully', data: banUser });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
