import { Request, Response } from 'express';
import { pool } from '../db';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM courses');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
};