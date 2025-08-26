import { Router } from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizSubmissions
} from '../controllers/quizController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all quizzes for a course offering
router.get('/offering/:offeringId', getQuizzes);

// Get a single quiz with questions and options
router.get('/:id', getQuiz);

// Create a new quiz
router.post('/offering/:offeringId', createQuiz);

// Update a quiz
router.put('/:id', updateQuiz);

// Delete a quiz
router.delete('/:id', deleteQuiz);

// Submit quiz answers (student)
router.post('/:id/submit', submitQuiz);

// Get quiz submissions (teacher)
router.get('/:id/submissions', getQuizSubmissions);

export default router;
