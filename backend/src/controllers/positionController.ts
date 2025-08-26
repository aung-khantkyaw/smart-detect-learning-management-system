import type { Request, Response } from 'express';
import { db } from '../db';
import { positions, users } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllPositions = async (req: Request, res: Response) => {
  try {
    const allPositions = await db.select().from(positions);
    res.json({ status: 'success', data: allPositions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch positions' });
  }
};

export const getPositionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const position = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
    if (position.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Position not found' });
    }
    res.json({ status: 'success', data: position[0] });
  } catch (error) {
    console.error('Error fetching position by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch position' });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const position = {
      name,
    };

    const newPosition = await db.insert(positions).values(position).returning();
    return res.status(201).json({ status: 'success', data: newPosition });
  } catch (error) {
    console.error('Error creating position:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedPosition = await db.update(positions)
      .set({ name })
      .where(eq(positions.id, id))
      .returning();

    if (updatedPosition.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Position not found' });
    }

    res.json({ status: 'success', data: updatedPosition[0] });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update position' });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedCount = await db.delete(positions).where(eq(positions.id, id)).returning();

    if (deletedCount.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Position not found' });
    }

    res.json({ status: 'success', message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete position' });
  }
};

export const getTeacherByPositionId = async (req: Request, res: Response) => {
  const { positionId } = req.params;

  try {
    const teachers = await db.select().from(users).where(eq(users.positionId, positionId));

    if (teachers.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No teachers found for this position' });
    }

    res.json({ status: 'success', data: teachers });
  } catch (error) {
    console.error('Error fetching teachers by position ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch teachers' });
  }
};
