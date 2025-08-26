import { Request, Response } from 'express';
import { db } from '../db';
import { 
  assignments, 
  assignmentSubmissions, 
  courseOfferings, 
  users 
} from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

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
    const { title, description, dueAt } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
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

// Submit assignment
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;
    const { fileUrl, textAnswer } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!fileUrl && !textAnswer) {
      return res.status(400).json({ error: 'Either file URL or text answer is required' });
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

    const submissionId = uuidv4();

    // Create submission
    const submission = await db
      .insert(assignmentSubmissions)
      .values({
        id: submissionId,
        assignmentId,
        studentId: userId,
        submittedAt: now,
        fileUrl,
        textAnswer,
        status: 'SUBMITTED',
        attemptNumber
      })
      .returning();

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
        fileUrl: assignmentSubmissions.fileUrl,
        textAnswer: assignmentSubmissions.textAnswer,
        aiScore: assignmentSubmissions.aiScore,
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
    const { aiScore, status } = req.body;

    if (typeof aiScore !== 'number' || aiScore < 0 || aiScore > 100) {
      return res.status(400).json({ error: 'AI score must be a number between 0 and 100' });
    }

    const updatedSubmission = await db
      .update(assignmentSubmissions)
      .set({
        aiScore: aiScore.toString(),
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
