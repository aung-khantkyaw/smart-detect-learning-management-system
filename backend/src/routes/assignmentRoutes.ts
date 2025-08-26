import { Router } from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  getStudentSubmissions,
  gradeSubmission,
} from '../controllers/assignmentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all assignments for a course offering
router.get('/offering/:offeringId', getAssignments);

// Get a single assignment
router.get('/:id', getAssignment);

// Create a new assignment
router.post('/offering/:offeringId', createAssignment);

// Update an assignment
router.put('/:id', updateAssignment);

// Delete an assignment
router.delete('/:id', deleteAssignment);

// Submit assignment (student)
router.post('/:id/submit', submitAssignment);

// Student: list own submissions for an assignment
router.get('/:id/my-submissions', getStudentSubmissions);

// Teacher: grade a submission
router.patch('/submissions/:submissionId/grade', gradeSubmission);

// Teacher: get all submissions for an assignment
router.get('/:id/submissions', getAssignmentSubmissions);

export default router;
