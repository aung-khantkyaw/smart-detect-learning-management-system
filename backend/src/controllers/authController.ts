import type { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import generateToken from '../utils/helper';

export const main = (req: Request, res: Response) => {
  const message = {
    status: 'Auth API',
    timestamp: new Date().toISOString()
  };

  return res.status(200).json({ status: 'success', data: message });
};

export const registrationUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ status: 'error', message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      username: req.body.username || email.split('@')[0],
      email,
      password: hashedPassword,
      role: req.body.role,
      fullName: req.body.fullName,

      department_id: req.body.department_id,
      position_id: req.body.position_id,

      major_id: req.body.major_id,
      academic_year_id: req.body.academic_year_id,
      studentNumber: req.body.studentNumber,
    };

    const newUser = await db.insert(users).values(user).returning();
    return res.status(201).json({ status: 'success', data: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    console.log('User found:', user[0]);

    const isPasswordValid = password == user[0].password; 
    if (!isPasswordValid) {
      
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = generateToken(user[0].id);

    const loginUser = await db.update(users).set({ lastLoginAt: new Date(), accessToken: token }).where(eq(users.id, user[0].id)).returning();

    const { password: _, ...userData } = loginUser[0];
    return res.status(200).json({ status: 'success', data: { ...userData, accessToken: token } });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    await db.update(users).set({ accessToken: null }).where(eq(users.id, userId));

    return res.status(200).json({ status: 'success', message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
