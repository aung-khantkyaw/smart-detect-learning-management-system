import { Request, Response } from 'express';
import { db } from '../db';
import { aiFlags, courseOfferings, courses } from '../db/schema';
import { eq, sum, desc } from 'drizzle-orm';

// GET /api/ai-flag/:id
// Returns all AI flag entries for a user and the total flagged count
export const getUserAiFlags = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch per-offering AI flags for the user with course context
    const items = await db
      .select({
        id: aiFlags.id,
        offeringId: aiFlags.offeringId,
        studentId: aiFlags.studentId,
        flaggedCount: aiFlags.flaggedCount,
        lastFlaggedAt: aiFlags.lastFlaggedAt,
        courseId: courseOfferings.courseId,
        courseCode: courses.code,
        courseTitle: courses.title,
      })
      .from(aiFlags)
      .leftJoin(courseOfferings, eq(aiFlags.offeringId, courseOfferings.id))
      .leftJoin(courses, eq(courseOfferings.courseId, courses.id))
      .where(eq(aiFlags.studentId, userId))
      .orderBy(desc(aiFlags.lastFlaggedAt));

    // Compute total flagged count
    const totalResult = await db
      .select({ total: sum(aiFlags.flaggedCount) })
      .from(aiFlags)
      .where(eq(aiFlags.studentId, userId));

    const totalCount = (totalResult[0]?.total as number | null) ?? 0;

    console.log(`Fetched ${items.length} AI flag records for user ${userId}, total flagged count: ${totalCount}`);

    return res.json({ userId, totalCount, items });
  } catch (error) {
    console.error('Error fetching AI flags:', error);
    return res.status(500).json({ error: 'Failed to fetch AI flags' });
  }
};
