import type { Request, Response } from 'express';
import { db } from '../db';
import { departments } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const allDepartments = await db.select().from(departments);
    res.json({ status: 'success', data: allDepartments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch departments' });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await db.select().from(departments).where(eq(departments.id, id));
    
    if (department.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Department not found' });
    }
    
    res.json({ status: 'success', data: department[0] });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch department' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const department = {
      name,
    };

    const newDepartment = await db.insert(departments).values(department).returning();
    return res.status(201).json({ status: 'success', data: newDepartment });
  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedDepartment = await db.update(departments)
      .set({ name })
      .where(eq(departments.id, id))
      .returning();

    if (updatedDepartment.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Department not found' });
    }

    return res.json({ status: 'success', data: updatedDepartment[0] });
  } catch (error) {
    console.error('Error updating department:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedDepartment = await db.delete(departments)
      .where(eq(departments.id, id))
      .returning();

    if (deletedDepartment.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Department not found' });
    }

    return res.json({ status: 'success', message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};