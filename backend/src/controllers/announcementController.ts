import type { Request, Response } from 'express';
import { db } from '../db';
import { announcements, courseOfferings, academicYears } from '../db/schema';
import { and, desc, eq } from 'drizzle-orm';

interface AuthRequest extends Request {
  user?: any;
}

// Create announcement (Admin or Teacher)
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  const { scope, scopeId, title, content } = req.body as {
    scope: 'COURSE' | 'ACADEMIC';
    scopeId: string;
    title: string;
    content: string;
  };

  try {
    // If teacher creates a COURSE announcement, ensure they own the offering
    if (req.user?.role === 'TEACHER' && scope === 'COURSE') {
      const offering = await db
        .select({ id: courseOfferings.id, teacherId: courseOfferings.teacherId })
        .from(courseOfferings)
        .where(eq(courseOfferings.id, scopeId))
        .limit(1);

      if (offering.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid course offering for scopeId' });
      }
      if (offering[0].teacherId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'You can only post announcements for your own course offerings' });
      }
    }

    // Determine final scopeId
    let finalScopeId = scopeId;
    if (scope === 'ACADEMIC') {
      // Prefer the user's academicYearId if present; otherwise, fall back to latest academic year
      if (req.user?.academicYearId) {
        finalScopeId = req.user.academicYearId as string;
      } else {
        const latestYear = await db
          .select({ id: academicYears.id, startDate: academicYears.startDate })
          .from(academicYears)
          .orderBy(desc(academicYears.startDate))
          .limit(1);
        if (latestYear.length === 0) {
          return res.status(400).json({ status: 'error', message: 'No academic year found to attach academic announcement' });
        }
        finalScopeId = latestYear[0].id as string;
      }
    }

    const [created] = await db
      .insert(announcements)
      .values({ scope, scopeId: finalScopeId, title, content, authorId: req.user?.id })
      .returning();

    try {
      // Broadcast real-time event to the appropriate room
      global.socketService?.emitToChatRoom(finalScopeId as string, scope, 'announcement-created', created);
    } catch (e) {
      console.warn('Socket emit failed (announcement-created):', e);
    }

    return res.status(201).json({ status: 'success', data: created });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Get list of announcements (everyone can view)
export const listAnnouncements = async (req: Request, res: Response) => {
  const { scope, scopeId, limit } = req.query as { scope?: string; scopeId?: string; limit?: string };

  try {
    const lim = limit ? Math.max(1, Math.min(100, parseInt(limit))) : undefined;

    if (scope || scopeId) {
      const conds = [] as any[];
      if (scope) conds.push(eq(announcements.scope, scope));
      if (scopeId) conds.push(eq(announcements.scopeId, scopeId));

      const qb = db
        .select()
        .from(announcements)
        .where(and(...conds))
        .orderBy(desc(announcements.createdAt));

      const result = lim ? await qb.limit(lim) : await qb;
      return res.status(200).json({ status: 'success', data: result });
    } else {
      const qb = db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt));
      const result = lim ? await qb.limit(lim) : await qb;
      return res.status(200).json({ status: 'success', data: result });
    }
  } catch (error) {
    console.error('Error listing announcements:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Get single announcement by id (everyone can view)
export const getAnnouncementById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const rows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Announcement not found' });
    }
    return res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Update announcement (Admin or owner teacher)
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body as { title?: string; content?: string };

  try {
    const rows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Announcement not found' });
    }

    const ann = rows[0] as any;

    if (req.user?.role !== 'ADMIN') {
      // If teacher, must be author or teacher of course offering
      if (req.user?.role !== 'TEACHER') {
        return res.status(403).json({ status: 'error', message: 'Not authorized' });
      }
      if (ann.authorId !== req.user.id) {
        if (ann.scope === 'COURSE') {
          const offering = await db
            .select({ id: courseOfferings.id, teacherId: courseOfferings.teacherId })
            .from(courseOfferings)
            .where(eq(courseOfferings.id, ann.scopeId))
            .limit(1);
          if (offering.length === 0 || offering[0].teacherId !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Not authorized to modify this announcement' });
          }
        } else {
          return res.status(403).json({ status: 'error', message: 'Not authorized to modify this announcement' });
        }
      }
    }

    const [updated] = await db
      .update(announcements)
      .set({ title: title ?? ann.title, content: content ?? ann.content, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();

    try {
      global.socketService?.emitToChatRoom(updated.scopeId as string, updated.scope as 'ACADEMIC' | 'COURSE', 'announcement-updated', updated);
    } catch (e) {
      console.warn('Socket emit failed (announcement-updated):', e);
    }

    return res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Delete announcement (Admin or owner teacher)
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const rows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Announcement not found' });
    }

    const ann = rows[0] as any;

    if (req.user?.role !== 'ADMIN') {
      if (req.user?.role !== 'TEACHER') {
        return res.status(403).json({ status: 'error', message: 'Not authorized' });
      }
      if (ann.authorId !== req.user.id) {
        if (ann.scope === 'COURSE') {
          const offering = await db
            .select({ id: courseOfferings.id, teacherId: courseOfferings.teacherId })
            .from(courseOfferings)
            .where(eq(courseOfferings.id, ann.scopeId))
            .limit(1);
          if (offering.length === 0 || offering[0].teacherId !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Not authorized to delete this announcement' });
          }
        } else {
          return res.status(403).json({ status: 'error', message: 'Not authorized to delete this announcement' });
        }
      }
    }

    await db.delete(announcements).where(eq(announcements.id, id));

    try {
      global.socketService?.emitToChatRoom(ann.scopeId as string, ann.scope as 'ACADEMIC' | 'COURSE', 'announcement-deleted', { id });
    } catch (e) {
      console.warn('Socket emit failed (announcement-deleted):', e);
    }
    return res.status(200).json({ status: 'success', message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
