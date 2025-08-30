import { Request, Response } from 'express';
import { db } from '../db';
import { 
  assignments, 
  assignmentSubmissions, 
  courseOfferings, 
  users,
  aiFlags,
  notifications 
} from '../db/schema';
import { createNotification as createNotificationHelper } from './notificationController';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm';

// Get all assignments
export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const assignmentsList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueAt: assignments.dueAt,
        createdAt: assignments.createdAt
      })
      .from(assignments)
      .orderBy(desc(assignments.createdAt));

    res.json({status: 'success', data: assignmentsList, count: assignmentsList.length});
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Get current (authenticated) student's submission stats across all assignments
export const getMySubmissionStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const rows = await db
      .select({
        total: sql<number>`COUNT(*)`,
        rejected: sql<number>`SUM(CASE WHEN ${assignmentSubmissions.status} = 'REJECTED_AI' THEN 1 ELSE 0 END)`
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.studentId, userId));

    const totalSubmissions = Number(rows[0]?.total) || 0;
    const rejectedAI = Number(rows[0]?.rejected) || 0;

    return res.json({ studentId: userId, totalSubmissions, rejectedAI });
  } catch (error) {
    console.error('Error fetching my submission stats:', error);
    return res.status(500).json({ error: 'Failed to fetch my submission stats' });
  }
};

// Get per-student submission stats across all assignments
export const getStudentSubmissionStats = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const rows = await db
      .select({
        total: sql<number>`COUNT(*)`,
        rejected: sql<number>`SUM(CASE WHEN ${assignmentSubmissions.status} = 'REJECTED_AI' THEN 1 ELSE 0 END)`
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.studentId, studentId));

    const totalSubmissions = Number(rows[0]?.total || 0);
    const rejectedAI = Number(rows[0]?.rejected || 0);

    console.log(`Fetched submission stats for student ${studentId}: total=${totalSubmissions}, rejectedAI=${rejectedAI}`);
    return res.json({ studentId, totalSubmissions, rejectedAI });
  } catch (error) {
    console.error('Error fetching student submission stats:', error);
    return res.status(500).json({ error: 'Failed to fetch student submission stats' });
  }
};

// Get AI flag count for a specific student in a specific offering
export const getAIFlagCount = async (req: Request, res: Response) => {
  try {
    const { offeringId, id: studentId } = req.params;

    // Get AI flag count from ai_flags table
    const rows = await db
      .select({
        flaggedCount: aiFlags.flaggedCount
      })
      .from(aiFlags)
      .where(
        and(
          eq(aiFlags.offeringId, offeringId),
          eq(aiFlags.studentId, studentId)
        )
      );

    const count = Number(rows[0]?.flaggedCount || 0);

    console.log(`AI flag count for student ${studentId} in offering ${offeringId}: ${count}`);
    return res.json({ count });
  } catch (error) {
    console.error('Error fetching AI flag count:', error);
    return res.status(500).json({ error: 'Failed to fetch AI flag count' });
  }
};

// Get REJECTED_AI counts per student for an offering (teacher view)
export const getRejectedAICountsForOffering = async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;

    if (!offeringId) {
      return res.status(400).json({ error: 'Offering ID is required' });
    }

    // Ensure offering exists
    const offering = await db
      .select({ id: courseOfferings.id })
      .from(courseOfferings)
      .where(eq(courseOfferings.id, offeringId))
      .limit(1);

    if (offering.length === 0) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    // Aggregate counts of REJECTED_AI submissions grouped by studentId for assignments in this offering
    const rows = await db
      .select({
        studentId: assignmentSubmissions.studentId,
        count: sql<number>`COUNT(*)`
      })
      .from(assignmentSubmissions)
      .leftJoin(assignments, eq(assignments.id, assignmentSubmissions.assignmentId))
      .where(
        and(
          eq(assignments.offeringId, offeringId),
          eq(assignmentSubmissions.status, 'REJECTED_AI')
        )
      )
      .groupBy(assignmentSubmissions.studentId);

    // Return as { studentId: count }
    const map: Record<string, number> = {};
    for (const r of rows) {
      if (r.studentId) map[r.studentId] = Number(r.count) || 0;
    }

    console.log(`Fetched REJECTED_AI counts for offering ${offeringId}, students affected: ${Object.keys(map).length}`);
    return res.json({ offeringId, counts: map });
  } catch (error) {
    console.error('Error fetching REJECTED_AI counts:', error);
    return res.status(500).json({ error: 'Failed to fetch REJECTED_AI counts' });
  }
};

// Get all assignments for a course offering
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;

    if (!offeringId) {
      return res.status(400).json({ error: 'Offering ID is required' });
    }

    const assignmentsList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        questionType: assignments.questionType,
        questionText: assignments.questionText,
        questionFileUrl: assignments.questionFileUrl,
        dueAt: assignments.dueAt,
        createdAt: assignments.createdAt
      })
      .from(assignments)
      .where(eq(assignments.offeringId, offeringId))
      .orderBy(desc(assignments.createdAt));

    res.json(assignmentsList);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Get a single assignment
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment[0]);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
};

// Create a new assignment
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;
    const { title, description, dueAt, questionType, questionText, questionFileUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!questionType || !['TEXT', 'PDF'].includes(questionType)) {
      return res.status(400).json({ error: 'Valid question type is required (TEXT or PDF)' });
    }

    if (questionType === 'TEXT' && !questionText) {
      return res.status(400).json({ error: 'Question text is required for TEXT type' });
    }

    if (questionType === 'PDF' && !questionFileUrl) {
      return res.status(400).json({ error: 'Question file URL is required for PDF type' });
    }

    // Verify the offering exists
    const offering = await db
      .select()
      .from(courseOfferings)
      .where(eq(courseOfferings.id, offeringId))
      .limit(1);

    if (offering.length === 0) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    const assignmentId = uuidv4();
    const newAssignment = await db
      .insert(assignments)
      .values({
        id: assignmentId,
        offeringId,
        title,
        description,
        questionType,
        questionText: questionType === 'TEXT' ? questionText : null,
        questionFileUrl: questionType === 'PDF' ? questionFileUrl : null,
        dueAt: dueAt ? new Date(dueAt) : null
      })
      .returning();

    res.status(201).json(newAssignment[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

// Update an assignment
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueAt } = req.body;

    const updatedAssignment = await db
      .update(assignments)
      .set({
        title,
        description,
        dueAt: dueAt ? new Date(dueAt) : null
      })
      .where(eq(assignments.id, id))
      .returning();

    if (updatedAssignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(updatedAssignment[0]);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

// Delete an assignment
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedAssignment = await db
      .delete(assignments)
      .where(eq(assignments.id, id))
      .returning();

    if (deletedAssignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// AI Detection helper function
const checkAIContent = async (text: string): Promise<{ prediction: string; confidence: number; probabilities: { human: number; ai: number } }> => {
  try {
    const response = await fetch('https://aungkhantkyaw.pythonanywhere.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`AI detection API failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI detection error:', error);
    throw error;
  }
};

// Create notification helper
const createNotification = async (userId: string, title: string, body: string) => {
  try {
    await db.insert(notifications).values({
      id: uuidv4(),
      userId,
      title,
      body
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Update AI flag helper
const updateAIFlag = async (offeringId: string, studentId: string) => {
  try {
    const existingFlag = await db
      .select()
      .from(aiFlags)
      .where(and(
        eq(aiFlags.offeringId, offeringId),
        eq(aiFlags.studentId, studentId)
      ))
      .limit(1);

    if (existingFlag.length > 0) {
      await db
        .update(aiFlags)
        .set({
          flaggedCount: existingFlag[0].flaggedCount + 1,
          lastFlaggedAt: new Date()
        })
        .where(eq(aiFlags.id, existingFlag[0].id));
    } else {
      await db.insert(aiFlags).values({
        id: uuidv4(),
        offeringId,
        studentId,
        flaggedCount: 1,
        lastFlaggedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating AI flag:', error);
  }
};

// Submit assignment
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;
    // Handle both JSON and FormData
    const textAnswer = req.body?.textAnswer || (req as any).body?.textAnswer;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!textAnswer || !textAnswer.trim()) {
      return res.status(400).json({ error: 'Text answer is required' });
    }

    // Check if assignment exists
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if assignment is overdue
    const now = new Date();
    if (assignment[0].dueAt && now > assignment[0].dueAt) {
      return res.status(400).json({ error: 'Assignment is overdue' });
    }

    // Check for existing PENDING submission (from teacher giving chance)
    const existingPendingSubmission = await db
      .select()
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, userId),
        eq(assignmentSubmissions.status, 'PENDING')
      ))
      .limit(1);

    // Get the latest attempt number for new submissions
    const latestSubmission = await db
      .select({ attemptNumber: assignmentSubmissions.attemptNumber })
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, userId)
      ))
      .orderBy(desc(assignmentSubmissions.attemptNumber))
      .limit(1);

    const attemptNumber = latestSubmission.length > 0 ? latestSubmission[0].attemptNumber : 1;

    // Check AI content
    let aiResult;
    let submissionStatus = 'SUBMITTED';
    
    try {
      aiResult = await checkAIContent(textAnswer);
      
      if (aiResult.prediction === 'ai') {
        submissionStatus = 'REJECTED_AI';
        
        // Update AI flag count
        await updateAIFlag(assignment[0].offeringId, userId);
        
        // Get student info for notifications
        const student = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        const studentName = student.length > 0 ? student[0].fullName : 'Student';
        
        // Notify student
        await createNotification(
          userId,
          'Assignment Flagged - AI Content Detected',
          `Your submission for "${assignment[0].title}" has been flagged as potentially AI-generated content. Please review and resubmit with original work.`
        );
        
        // Get teacher(s) for this offering and notify them
        const teachers = await db
          .select({ id: users.id })
          .from(users)
          .innerJoin(courseOfferings, eq(courseOfferings.teacherId, users.id))
          .where(eq(courseOfferings.id, assignment[0].offeringId));
        
        for (const teacher of teachers) {
          await createNotification(
            teacher.id,
            'Student Assignment Flagged - AI Content',
            `${studentName}'s submission for "${assignment[0].title}" has been flagged as potentially AI-generated content (Confidence: ${(aiResult.confidence * 100).toFixed(1)}%).`
          );
        }
      }
    } catch (aiError) {
      console.error('AI detection failed, allowing submission:', aiError);
      // If AI detection fails, allow the submission to proceed
    }

    let submission;

    // If there's an existing PENDING submission, update it and increment attempt number
    if (existingPendingSubmission.length > 0) {
      const currentAttempt = existingPendingSubmission[0].attemptNumber || 1;
      submission = await db
        .update(assignmentSubmissions)
        .set({
          submittedAt: now,
          textAnswer,
          status: submissionStatus as 'PENDING' | 'SUBMITTED' | 'GRADED' | 'REJECTED_AI',
          attemptNumber: currentAttempt + 1 // Increment attempt number on resubmission
        })
        .where(eq(assignmentSubmissions.id, existingPendingSubmission[0].id))
        .returning();
    } else {
      // Create new submission
      const submissionId = uuidv4();
      const newAttemptNumber = latestSubmission.length > 0 ? latestSubmission[0].attemptNumber + 1 : 1;
      
      submission = await db
        .insert(assignmentSubmissions)
        .values({
          id: submissionId,
          assignmentId,
          studentId: userId,
          submittedAt: now,
          textAnswer,
          score: null,
          status: submissionStatus as 'PENDING' | 'SUBMITTED' | 'GRADED' | 'REJECTED_AI',
          attemptNumber: newAttemptNumber
        })
        .returning();
    }

    // Notify teacher about new submission (only if not flagged)
    if (submissionStatus === 'SUBMITTED') {
      const teachers = await db
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .innerJoin(courseOfferings, eq(courseOfferings.teacherId, users.id))
        .where(eq(courseOfferings.id, assignment[0].offeringId));

      const studentName = (req as any).user?.fullName || 'Student';
      for (const teacher of teachers) {
        await createNotificationHelper(
          teacher.id,
          'New Assignment Submission',
          `${studentName} has submitted "${assignment[0].title}". Please review and grade the submission.`
        );
      }
    }

    if (submissionStatus === 'REJECTED_AI' && aiResult) {
      return res.status(400).json({
        error: 'Submission flagged as AI-generated content',
        details: {
          prediction: aiResult.prediction,
          confidence: aiResult.confidence,
          aiProbability: aiResult.probabilities.ai
        }
      });
    }

    res.status(201).json(submission[0]);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

// Get assignment submissions for an assignment (teacher view)
export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;

    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        submittedAt: assignmentSubmissions.submittedAt,
        textAnswer: assignmentSubmissions.textAnswer,
        score: assignmentSubmissions.score,
        status: assignmentSubmissions.status,
        attemptNumber: assignmentSubmissions.attemptNumber,
        studentId: assignmentSubmissions.studentId,
        studentName: users.fullName,
        studentEmail: users.email
      })
      .from(assignmentSubmissions)
      .leftJoin(users, eq(assignmentSubmissions.studentId, users.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    res.status(500).json({ error: 'Failed to fetch assignment submissions' });
  }
};

// Get student's submissions for an assignment
export const getStudentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const submissions = await db
      .select()
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, userId)
      ))
      .orderBy(desc(assignmentSubmissions.attemptNumber));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
};

// Grade assignment submission
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { score, status } = req.body;

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
    }

    const updatedSubmission = await db
      .update(assignmentSubmissions)
      .set({
        score: score.toString(),
        status: status || 'GRADED'
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    if (updatedSubmission.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(updatedSubmission[0]);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
};

// Get all submissions for a student
export const getStudentAllSubmissions = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        submittedAt: assignmentSubmissions.submittedAt,
        textAnswer: assignmentSubmissions.textAnswer,
        score: assignmentSubmissions.score,
        status: assignmentSubmissions.status,
        attemptNumber: assignmentSubmissions.attemptNumber
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.studentId, studentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
};

// Get assignments for student by course ID
export const getAssignmentsForStudent = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Support both courseId and offeringId like in quiz controller
    let offeringIdToUse: string | null = null;
    const tryOffering = await db
      .select({ id: courseOfferings.id })
      .from(courseOfferings)
      .where(eq(courseOfferings.id, courseId))
      .limit(1);

    if (tryOffering.length > 0) {
      offeringIdToUse = tryOffering[0].id;
    } else {
      // Fall back to interpreting as courseId
      const offering = await db
        .select({ id: courseOfferings.id })
        .from(courseOfferings)
        .where(eq(courseOfferings.courseId, courseId))
        .limit(1);

      if (offering.length === 0) {
        return res.status(404).json({ error: 'Course offering not found' });
      }
      offeringIdToUse = offering[0].id;
    }

    // Get assignments for the offering
    const assignmentsList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        questionType: assignments.questionType,
        questionText: assignments.questionText,
        questionFileUrl: assignments.questionFileUrl,
        dueAt: assignments.dueAt,
        createdAt: assignments.createdAt
      })
      .from(assignments)
      .where(eq(assignments.offeringId, offeringIdToUse))
      .orderBy(desc(assignments.createdAt));

    res.json(assignmentsList);
  } catch (error) {
    console.error('Error fetching assignments for student:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Give student a chance to resubmit (reset REJECTED_AI status)
export const giveResubmissionChance = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    // Get the submission with attempt number
    const submission = await db
      .select({
        id: assignmentSubmissions.id,
        status: assignmentSubmissions.status,
        attemptNumber: assignmentSubmissions.attemptNumber,
        studentId: assignmentSubmissions.studentId
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const sub = submission[0];

    // Only allow for REJECTED_AI submissions
    if (sub.status !== 'REJECTED_AI') {
      return res.status(400).json({ error: 'Can only give chance to REJECTED_AI submissions' });
    }

    // Check if student has exceeded max attempts (3)
    if (sub.attemptNumber >= 3) {
      return res.status(400).json({ error: 'Student has already reached maximum attempts (3)' });
    }

    // Update submission status to allow resubmission
    await db
      .update(assignmentSubmissions)
      .set({
        status: 'PENDING' // Reset to pending so student can resubmit
      })
      .where(eq(assignmentSubmissions.id, submissionId));

    // Notify student about the chance
    await createNotification(
      sub.studentId,
      'Resubmission Chance Given',
      'Your teacher has given you another chance to resubmit your assignment. Please submit original work.'
    );

    return res.json({ message: 'Resubmission chance given successfully' });
  } catch (error) {
    console.error('Error giving resubmission chance:', error);
    return res.status(500).json({ error: 'Failed to give resubmission chance' });
  }
};
