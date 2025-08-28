import { Request, Response } from 'express';
import { db } from '../db';
import { 
  quizzes, 
  quizQuestions, 
  quizOptions, 
  quizSubmissions, 
  quizAnswers, 
  courseOfferings, 
  users,
  enrollments 
} from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Get all quizzes
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzesList = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        instructions: quizzes.instructions,
        openAt: quizzes.openAt,
        closeAt: quizzes.closeAt,
        createdAt: quizzes.createdAt
      })
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    res.json(quizzesList);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Get all quizzes for a course offering
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // Route is /offering/:id, but older code expected :offeringId
    const { id, offeringId } = req.params as { id?: string; offeringId?: string };
    const resolvedOfferingId = offeringId || id;

    if (!resolvedOfferingId) {
      return res.status(400).json({ error: 'Offering ID is required' });
    }

    const quizzesList = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        instructions: quizzes.instructions,
        openAt: quizzes.openAt,
        closeAt: quizzes.closeAt,
        createdAt: quizzes.createdAt
      })
      .from(quizzes)
      .where(eq(quizzes.offeringId, resolvedOfferingId))
      .orderBy(desc(quizzes.createdAt));

    res.json({status: 'success', data: quizzesList, count: quizzesList.length});
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Get a single quiz with questions and options
export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get quiz details
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);

    if (quiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions with options
    const questions = await db
      .select({
        id: quizQuestions.id,
        questionType: quizQuestions.questionType,
        prompt: quizQuestions.prompt,
        points: quizQuestions.points
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, id));

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db
          .select()
          .from(quizOptions)
          .where(eq(quizOptions.questionId, question.id));

        return {
          ...question,
          options
        };
      })
    );

    res.json({
      ...quiz[0],
      questions: questionsWithOptions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

// Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
  try {
    // Route is /offering/:id, but older code expected :offeringId
    const { id, offeringId } = req.params as { id?: string; offeringId?: string };
    const resolvedOfferingId = offeringId || id;
    const { title, instructions, openAt, closeAt, questions } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!resolvedOfferingId) {
      return res.status(400).json({ error: 'Offering ID is required' });
    }

    // Verify the offering exists
    const offering = await db
      .select()
      .from(courseOfferings)
      .where(eq(courseOfferings.id, resolvedOfferingId))
      .limit(1);

    if (offering.length === 0) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    const quizId = uuidv4();

    // Create quiz
    const newQuiz = await db
      .insert(quizzes)
      .values({
        id: quizId,
        offeringId: resolvedOfferingId,
        title,
        instructions,
        openAt: openAt ? new Date(openAt) : null,
        closeAt: closeAt ? new Date(closeAt) : null
      })
      .returning();

    // Create questions and options if provided
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        const questionId = uuidv4();
        
        await db
          .insert(quizQuestions)
          .values({
            id: questionId,
            quizId,
            questionType: question.questionType,
            prompt: question.prompt,
            points: question.points || '1'
          });

        // Create options for multiple choice questions
        if (question.options && Array.isArray(question.options)) {
          for (const option of question.options) {
            await db
              .insert(quizOptions)
              .values({
                id: uuidv4(),
                questionId,
                optionText: option.optionText,
                isCorrect: option.isCorrect || false
              });
          }
        }
      }
    }

    res.status(201).json(newQuiz[0]);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

// Update a quiz
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, instructions, openAt, closeAt } = req.body;

    const updatedQuiz = await db
      .update(quizzes)
      .set({
        title,
        instructions,
        openAt: openAt ? new Date(openAt) : null,
        closeAt: closeAt ? new Date(closeAt) : null
      })
      .where(eq(quizzes.id, id))
      .returning();

    if (updatedQuiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(updatedQuiz[0]);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

// Delete a quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedQuiz = await db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning();

    if (deletedQuiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const { answers } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if quiz exists and is open
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const now = new Date();
    if (quiz[0].openAt && now < quiz[0].openAt) {
      return res.status(400).json({ error: 'Quiz is not yet open' });
    }
    if (quiz[0].closeAt && now > quiz[0].closeAt) {
      return res.status(400).json({ error: 'Quiz is closed' });
    }

    // Check if user already submitted
    const existingSubmission = await db
      .select()
      .from(quizSubmissions)
      .where(and(
        eq(quizSubmissions.quizId, quizId),
        eq(quizSubmissions.studentId, userId)
      ))
      .limit(1);

    if (existingSubmission.length > 0) {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    const submissionId = uuidv4();

    // Create submission
    const submission = await db
      .insert(quizSubmissions)
      .values({
        id: submissionId,
        quizId,
        studentId: userId,
        submittedAt: now,
        status: 'SUBMITTED'
      })
      .returning();

    // Save answers
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await db
          .insert(quizAnswers)
          .values({
            id: uuidv4(),
            submissionId,
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds || null,
            shortTextAnswer: answer.shortTextAnswer || null
          });
      }
    }

    // Calculate score automatically for multiple choice questions
    let totalScore = 0;
    let maxScore = 0;

    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        // Get question details
        const question = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.id, answer.questionId))
          .limit(1);

        if (question.length > 0) {
          maxScore += parseFloat(question[0].points);

          // For multiple choice questions, check if answer is correct
          if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
            const correctOptions = await db
              .select()
              .from(quizOptions)
              .where(and(
                eq(quizOptions.questionId, answer.questionId),
                eq(quizOptions.isCorrect, true)
              ));

            const correctOptionIds = correctOptions.map(opt => opt.id);
            const selectedIds = answer.selectedOptionIds;

            // Check if selected answers match correct answers exactly
            const isCorrect = correctOptionIds.length === selectedIds.length &&
              correctOptionIds.every(id => selectedIds.includes(id));

            if (isCorrect) {
              totalScore += parseFloat(question[0].points);
            }
          }
        }
      }
    }

    // Update submission with calculated score
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    await db
      .update(quizSubmissions)
      .set({
        score: scorePercentage.toFixed(2),
        status: 'GRADED'
      })
      .where(eq(quizSubmissions.id, submissionId));

    res.status(201).json({
      ...submission[0],
      score: scorePercentage.toFixed(2),
      status: 'GRADED'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz', details: errorMessage });
  }
};

// Get quiz submissions for a quiz (teacher view)
export const getQuizSubmissions = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;

    const submissions = await db
      .select({
        id: quizSubmissions.id,
        submittedAt: quizSubmissions.submittedAt,
        score: quizSubmissions.score,
        status: quizSubmissions.status,
        studentId: quizSubmissions.studentId,
        studentName: users.fullName,
        studentEmail: users.email
      })
      .from(quizSubmissions)
      .leftJoin(users, eq(quizSubmissions.studentId, users.id))
      .where(eq(quizSubmissions.quizId, quizId))
      .orderBy(desc(quizSubmissions.submittedAt));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz submissions' });
  }
};

// Get quizzes for enrolled student by course ID
export const getQuizzesForStudent = async (req: Request, res: Response) => {
  try {
    // Route is /course/:id, but older code expected :courseId
    const { id, courseId } = req.params as { id?: string; courseId?: string };
    const resolvedCourseId = courseId || id;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!resolvedCourseId) {
      return res.status(400).json({ error: 'Course or Offering ID is required' });
    }

    // The frontend passes offeringId in the URL. Support both offeringId and courseId:
    // 1) Try as offeringId directly
    let offeringIdToUse: string | null = null;
    const tryOffering = await db
      .select({ id: courseOfferings.id })
      .from(courseOfferings)
      .where(eq(courseOfferings.id, resolvedCourseId))
      .limit(1);

    if (tryOffering.length > 0) {
      offeringIdToUse = tryOffering[0].id;
    } else {
      // 2) Fall back to interpreting provided ID as courseId
      const offering = await db
        .select({ id: courseOfferings.id })
        .from(courseOfferings)
        .where(eq(courseOfferings.courseId, resolvedCourseId))
        .limit(1);

      if (offering.length === 0) {
        return res.status(404).json({ error: 'Course offering not found' });
      }
      offeringIdToUse = offering[0].id;
    }

    // Get quizzes for the resolved offering
    const quizzesList = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        instructions: quizzes.instructions,
        openAt: quizzes.openAt,
        closeAt: quizzes.closeAt,
        createdAt: quizzes.createdAt
      })
      .from(quizzes)
      .where(eq(quizzes.offeringId, offeringIdToUse))
      .orderBy(desc(quizzes.createdAt));

    res.json(quizzesList);
  } catch (error) {
    console.error('Error fetching quizzes for student:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Get user's quiz submissions
export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    // Route is /submissions/user/:id, but older code expected :userId
    const { id, userId } = req.params as { id?: string; userId?: string };
    const resolvedUserId = userId || id;
    
    if (!resolvedUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userSubmissions = await db
      .select({
        id: quizSubmissions.id,
        quizId: quizSubmissions.quizId,
        submittedAt: quizSubmissions.submittedAt,
        score: quizSubmissions.score,
        status: quizSubmissions.status
      })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.studentId, resolvedUserId));

    res.json(userSubmissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Failed to fetch user submissions' });
  }
};

// Get quiz with submission status for a specific student
export const getQuizWithSubmission = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get quiz details
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions with options
    const questions = await db
      .select({
        id: quizQuestions.id,
        questionType: quizQuestions.questionType,
        prompt: quizQuestions.prompt,
        points: quizQuestions.points
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId));

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db
          .select()
          .from(quizOptions)
          .where(eq(quizOptions.questionId, question.id));

        return {
          ...question,
          options
        };
      })
    );

    // Check if user has submitted this quiz
    const submission = await db
      .select()
      .from(quizSubmissions)
      .where(and(
        eq(quizSubmissions.quizId, quizId),
        eq(quizSubmissions.studentId, userId)
      ))
      .limit(1);

    res.json({
      ...quiz[0],
      questions: questionsWithOptions,
      submission: submission.length > 0 ? submission[0] : null,
      isSubmitted: submission.length > 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching quiz with submission:', error);
    res.status(500).json({ error: 'Failed to fetch quiz', details: errorMessage });
  }
};
