import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    
    if (user.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(403).json({ status: 'error', message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }

  next();
};

export const requireAdminOrSelf = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
    return res.status(403).json({ status: 'error', message: 'Admin or Self access required' });
  }

  next();
};

export const requireAdminOrTeacher = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ status: 'error', message: 'Admin or Teacher access required' });
  }

  next();
};

export const requireSelf = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  if (req.user.id !== req.params.id) {
    return res.status(403).json({ status: 'error', message: 'Self access required' });
  }

  next();
};