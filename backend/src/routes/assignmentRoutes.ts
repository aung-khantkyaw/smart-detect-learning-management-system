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
  getRejectedAICountsForOffering,
  getStudentSubmissionStats,
  getMySubmissionStats,
  giveResubmissionChance,
  getAIFlagCount,
} from '../controllers/assignmentController';
import { authenticateToken, requireAdminOrTeacher, requireStudent } from '../middleware/auth';
import { getMulterUpload } from '../utils/multerUpload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all assignments
router.get('/', getAllAssignments);

// Get all assignments for a course offering
router.get('/offering/:offeringId', getAssignments);

// Get REJECTED_AI counts per student for a course offering
router.get('/offering/:offeringId/rejected-ai-counts', requireAdminOrTeacher, getRejectedAICountsForOffering);

// Get a single assignment
router.get('/:id', getAssignment);

// Create a new assignment
router.post('/offering/:offeringId', requireAdminOrTeacher, createAssignment);

// Update an assignment
router.put('/:id', requireAdminOrTeacher, updateAssignment);

// Delete an assignment
router.delete('/:id', requireAdminOrTeacher, deleteAssignment);

// Submit assignment (student)
const assignmentUpload = getMulterUpload('assignments');
router.post('/:id/submit', requireStudent, assignmentUpload.none(), submitAssignment);

// Student: list own submissions for an assignment
router.get('/:id/my-submissions', requireStudent, getStudentSubmissions);

// Teacher: grade a submission
router.patch('/submissions/:submissionId/grade', requireAdminOrTeacher, gradeSubmission);

// Teacher: get all submissions for an assignment
router.get('/:id/submissions', requireAdminOrTeacher, getAssignmentSubmissions);

// Get all submissions for a student
router.get('/submissions/student/:studentId', getStudentAllSubmissions);

// Get per-student submission stats (total and REJECTED_AI)
router.get('/submissions/student/:studentId/stats', requireAdminOrTeacher, getStudentSubmissionStats);

// Get my submission stats (student self-access)
router.get('/submissions/me/stats', requireStudent, getMySubmissionStats);

// Give resubmission chance for REJECTED_AI submissions
router.patch('/submissions/:submissionId/give-chance', requireAdminOrTeacher, giveResubmissionChance);

// Get assignments for student by course ID
router.get('/course/:courseId', getAssignmentsForStudent);

// Get AI flag count for a specific student in a specific offering
router.get('/ai-flag/:offeringId/:id/count', requireAdminOrTeacher, getAIFlagCount);

export default router;
