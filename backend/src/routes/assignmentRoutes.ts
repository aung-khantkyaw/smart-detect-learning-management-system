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
  getAllAssignments,
  getStudentAllSubmissions,
  getAssignmentsForStudent,
} from '../controllers/assignmentController';
import { authenticateToken, requireAdminOrTeacher, requireStudent } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all assignments
router.get('/', getAllAssignments);

// Get all assignments for a course offering
router.get('/offering/:offeringId', getAssignments);

// Get a single assignment
router.get('/:id', getAssignment);

// Create a new assignment
router.post('/offering/:offeringId', requireAdminOrTeacher, createAssignment);

// Update an assignment
router.put('/:id', requireAdminOrTeacher, updateAssignment);

// Delete an assignment
router.delete('/:id', requireAdminOrTeacher, deleteAssignment);

// Submit assignment (student)
router.post('/:id/submit', requireStudent, submitAssignment);

// Student: list own submissions for an assignment
router.get('/:id/my-submissions', requireStudent, getStudentSubmissions);

// Teacher: grade a submission
router.patch('/submissions/:submissionId/grade', requireAdminOrTeacher, gradeSubmission);

// Teacher: get all submissions for an assignment
router.get('/:id/submissions', requireAdminOrTeacher, getAssignmentSubmissions);

// Get all submissions for a student
router.get('/submissions/student/:studentId', getStudentAllSubmissions);

// Get assignments for student by course ID
router.get('/course/:courseId', getAssignmentsForStudent);

export default router;
