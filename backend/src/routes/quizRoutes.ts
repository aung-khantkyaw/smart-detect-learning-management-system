import { Router } from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizSubmissions,
  getAllQuizzes,
  getQuizzesForStudent,
  getUserSubmissions,
  getQuizWithSubmission
} from '../controllers/quizController';
import { authenticateToken, requireAdminOrTeacher, requireStudent } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all quizzes
router.get('/', getAllQuizzes);

// Get all quizzes for a course offering
router.get('/offering/:id', getQuizzes);

// Get a single quiz with questions and options
router.get('/:id', getQuiz);

// Get quiz with submission status for student
router.get('/:id/student', getQuizWithSubmission);

// Create a new quiz
router.post('/offering/:id', requireAdminOrTeacher, createQuiz);

// Update a quiz
router.put('/:id', requireAdminOrTeacher, updateQuiz);

// Delete a quiz
router.delete('/:id', requireAdminOrTeacher, deleteQuiz);

// Submit quiz answers (student)
router.post('/:id/submit', requireStudent, submitQuiz);

// Get quiz submissions (teacher)
router.get('/:id/submissions', requireAdminOrTeacher, getQuizSubmissions);

// Get quizzes for enrolled student by course ID
router.get('/course/:id', getQuizzesForStudent);

// Get user's quiz submissions
router.get('/submissions/user/:id', getUserSubmissions);

export default router;
