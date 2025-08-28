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
    const response = await fetch('https://laziestant-ai-text-detection.onrender.com/predict', {
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

    // Get the latest attempt number
    const latestSubmission = await db
      .select({ attemptNumber: assignmentSubmissions.attemptNumber })
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, userId)
      ))
      .orderBy(desc(assignmentSubmissions.attemptNumber))
      .limit(1);

    const attemptNumber = latestSubmission.length > 0 ? latestSubmission[0].attemptNumber + 1 : 1;

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

    const submissionId = uuidv4();

    // Create submission
    const submission = await db
      .insert(assignmentSubmissions)
      .values({
        id: submissionId,
        assignmentId,
        studentId: userId,
        submittedAt: now,
        textAnswer,
        score: null, // Teacher will grade later
        status: submissionStatus as 'PENDING' | 'SUBMITTED' | 'GRADED' | 'REJECTED_AI',
        attemptNumber
      })
      .returning();

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
