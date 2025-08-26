import { Router } from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizSubmissions,
  getAllQuizzes
} from '../controllers/quizController';
import { authenticateToken, requireAdminOrTeacher, requireStudent } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all quizzes
router.get('/', getAllQuizzes);

// Get all quizzes for a course offering
router.get('/offering/:offeringId', getQuizzes);

// Get a single quiz with questions and options
router.get('/:id', getQuiz);

// Create a new quiz
router.post('/offering/:offeringId', requireAdminOrTeacher, createQuiz);

// Update a quiz
router.put('/:id', requireAdminOrTeacher, updateQuiz);

// Delete a quiz
router.delete('/:id', requireAdminOrTeacher, deleteQuiz);

// Submit quiz answers (student)
router.post('/:id/submit', requireStudent, submitQuiz);

// Get quiz submissions (teacher)
router.get('/:id/submissions', requireAdminOrTeacher, getQuizSubmissions);

export default router;
