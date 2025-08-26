# API Routes Documentation

## Middleware Types

- `authenticateToken` - Validates JWT token
- `requireAdmin` - Requires admin role
- `requireAdminOrSelf` - Requires admin role or user accessing own data
- `requireAdminOrTeacher` - Requires admin or teacher role

## Authentication Routes (`/auth`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/test-auth` | `main` | None | Test authentication endpoint | ✅
| POST | `/register` | `registrationUser` | `authenticateToken`, `requireAdmin` | Register new user (admin only) | ✅
| POST | `/login` | `loginUser` | None | User login |✅
| POST | `/logout` | `logoutUser` | `authenticateToken` | User logout |✅
| DELETE | `/delete` | `deleteUser` | `authenticateToken`, `requireAdminOrSelf` | Delete user account |✅

## User Routes (`/users`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllUsers` | `authenticateToken` | Get all users |✅
| GET | `/:id` | `getUserById` | `authenticateToken` | Get user by ID |✅
| PUT | `/:id` | `updateUser` | `authenticateToken`, `requireAdminOrSelf` | Update user |✅
| PATCH | `/:id/activate` | `banUser` | `authenticateToken`, `requireAdmin` | Toggle user active status |✅


## Academic Year Routes (`/academic-years`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllAcademicYears` | `authenticateToken` | Get all academic years |✅
| GET | `/:id` | `getAcademicYearById` | `authenticateToken` | Get academic year by ID |✅
| POST | `/` | `createAcademicYear` | `authenticateToken`, `requireAdmin` | Create academic year |✅
| PUT | `/:id` | `updateAcademicYear` | `authenticateToken`, `requireAdmin` | Update academic year |✅
| DELETE | `/:id` | `deleteAcademicYear` | `authenticateToken`, `requireAdmin` | Delete academic year |✅
| GET | `/:academicYearId/course-offerings` | `getOfferingCoursesByAcademicYearId` | `authenticateToken` | Get course offerings by academic year |❎
| GET | `/:academicYearId/students` | `getAllStudentsByAcademicYear` | `authenticateToken`, `requireAdminOrTeacher` | Get students by academic year |❎
| GET | `/:academicYearId/chat-room` | `getAcademicChatRoomByAcademicYearId` | `authenticateToken` | Get chat room by academic year |❎

## Course Routes (`/courses`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllCourses` | `authenticateToken` | Get all courses |✅
| GET | `/:id` | `getCourseById` | `authenticateToken` | Get course by ID |✅
| POST | `/` | `createCourse` | `authenticateToken`, `requireAdmin` | Create course |✅
| PUT | `/:id` | `updateCourse` | `authenticateToken`, `requireAdmin` | Update course |✅
| DELETE | `/:id` | `deleteCourse` | `authenticateToken`, `requireAdmin` | Delete course |✅
| GET | `/:courseId/course-offerings` | `getOfferingCoursesByCourseId` | `authenticateToken`, `requireAdmin` | Get course offerings by course |❎

## Course Offering Routes (`/course-offerings`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllCourseOfferings` | `authenticateToken` | Get all course offerings |✅
| GET | `/:id` | `getCourseOfferingById` | `authenticateToken` | Get course offering by ID |✅
| POST | `/` | `createCourseOffering` | `authenticateToken`, `requireAdmin` | Create course offering |✅
| PUT | `/:id` | `updateCourseOffering` | `authenticateToken`, `requireAdmin` | Update course offering |✅
| DELETE | `/:id` | `deleteCourseOffering` | `authenticateToken`, `requireAdmin` | Delete course offering |✅

## Department Routes (`/departments`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllDepartments` | `authenticateToken` | Get all departments |✅
| GET | `/:id` | `getDepartmentById` | `authenticateToken` | Get department by ID |✅
| POST | `/` | `createDepartment` | `authenticateToken`, `requireAdmin` | Create department |✅
| PUT | `/:id` | `updateDepartment` | `authenticateToken`, `requireAdmin` | Update department |✅
| DELETE | `/:id` | `deleteDepartment` | `authenticateToken`, `requireAdmin` | Delete department |✅
| GET | `/:departmentId/courses` | `getCourseByDepartmentId` | `authenticateToken` | Get courses by department |❎❎
| GET | `/:departmentId/teachers` | `getTeacherByDepartmentId` | `authenticateToken` | Get teachers by department |❎❎

## Major Routes (`/majors`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllMajors` | `authenticateToken` | Get all majors |✅
| GET | `/:id` | `getMajorById` | `authenticateToken` | Get major by ID |✅
| POST | `/` | `createMajor` | `authenticateToken`, `requireAdmin` | Create major |✅
| PUT | `/:id` | `updateMajor` | `authenticateToken`, `requireAdmin` | Update major |✅
| DELETE | `/:id` | `deleteMajor` | `authenticateToken`, `requireAdmin` | Delete major |✅
| GET | `/:id/students` | `getStudentsByMajorId` | `authenticateToken`, `requireAdminOrTeacher` | Get students by major |❎❎

## Position Routes (`/positions`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllPositions` | `authenticateToken` | Get all positions |✅
| GET | `/:id` | `getPositionById` | `authenticateToken` | Get position by ID |✅
| POST | `/` | `createPosition` | `authenticateToken`, `requireAdmin` | Create position |✅
| PUT | `/:id` | `updatePosition` | `authenticateToken`, `requireAdmin` | Update position |✅
| DELETE | `/:id` | `deletePosition` | `authenticateToken`, `requireAdmin` | Delete position |✅
| GET | `/:positionId/teachers` | `getTeacherByPositionId` | `authenticateToken` | Get teachers by position |❎❎

## Enrollment Routes (`/enrollments`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllEnrollments` | `authenticateToken` | Get all enrollments |✅
| GET | `/:id` | `getEnrollmentById` | `authenticateToken` | Get enrollment by ID |✅
| POST | `/` | `createEnrollment` | `authenticateToken`, `requireAdmin` | Create enrollment |✅
| PUT | `/:id` | `updateEnrollment` | `authenticateToken`, `requireAdmin` | Update enrollment |✅
| DELETE | `/:id` | `deleteEnrollment` | `authenticateToken`, `requireAdmin` | Delete enrollment |✅

## Chat Routes (`/chat`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| POST | `/notification` | `sendCourseNotification` | None | Send course notification |❎
| POST | `/announcement` | `broadcastAnnouncement` | None | Broadcast announcement |❎

## Chat Room Routes (`/chat-rooms`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllChatRooms` | `authenticateToken` | Get all chat rooms |❎
| GET | `/academic` | `getAllAcademicChatRooms` | `authenticateToken` | Get all academic chat rooms |❎
| GET | `/academic/:id` | `getAcademicChatRoomById` | `authenticateToken` | Get academic chat room by ID |❎
| GET | `/academic/:id/members` | `getAcademicChatRoomMembers` | `authenticateToken` | Get members of an academic chat room |❎
| GET | `/course` | `getAllCourseChatRooms` | `authenticateToken` | Get all course chat rooms |❎
| GET | `/course/:id` | `getCourseChatRoomById` | `authenticateToken` | Get course chat room by ID |❎
| GET | `/course/:id/members` | `getCourseChatRoomMembers` | `authenticateToken` | Get members of a course chat room |❎
| GET | `/:roomType/:roomId/messages` | `getChatMessages` | `authenticateToken` | Get chat messages for a room |❎
| POST | `/send-message` | `sendMessage` | `authenticateToken`, `fileUploadMiddleware`, `validateChatMessage` | Send a chat message (text/file) |❎
| DELETE | `/messages/:messageId` | `deleteMessage` | `authenticateToken` | Delete a chat message |❎
| GET | `/messages/:messageId/download` | `downloadChatFile` | `authenticateToken` | Download an attached chat file |❎

## Announcements Routes (`/announcements`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `listAnnouncements` | `authenticateToken` | List announcements with optional filters: `scope=COURSE|ACADEMIC`, `scopeId=<uuid>`, `limit=<n>` | ✅ |
| GET | `/:id` | `getAnnouncementById` | `authenticateToken` | Get single announcement by id | ✅ |
| POST | `/` | `createAnnouncement` | `authenticateToken`, `requireAdminOrTeacher` | Create a new announcement (Admin/Teacher only) | ✅ |
| PUT | `/:id` | `updateAnnouncement` | `authenticateToken`, `requireAdminOrTeacher` | Update announcement (Admin; Teacher must be author or owner of course offering) | ✅ |
| DELETE | `/:id` | `deleteAnnouncement` | `authenticateToken`, `requireAdminOrTeacher` | Delete announcement (Admin; Teacher must be author or owner of course offering) | ✅ |

## Materials Routes (`/materials`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `listMaterials` | `authenticateToken` | List materials for an offering. Requires `offeringId` query param. Access: Admin; Teacher who owns the offering; Enrolled Student | ✅ |
| GET | `/:id` | `getMaterialById` | `authenticateToken` | Get a single material by id (same access as list) | ✅ |
| GET | `/:id/download` | `download` | `authenticateToken` | Download the attached file if present (same access as list) | ✅ |
| POST | `/` | `createMaterial` | `authenticateToken`, `requireAdminOrTeacher`, `materialsUpload`, `validateCreateMaterial` | Create a material with optional file upload. Only Admin or the Teacher who owns the offering | ✅ |
| PUT | `/:id` | `updateMaterial` | `authenticateToken`, `requireAdminOrTeacher`, `materialsUpload`, `validateUpdateMaterial` | Update title/description and optionally replace file (only Admin or owning Teacher) | ✅ |
| DELETE | `/:id` | `deleteMaterial` | `authenticateToken`, `requireAdminOrTeacher` | Delete a material (only Admin or owning Teacher) | ✅ |

## Quiz Routes (`/quizzes`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `listQuizzes` | `authenticateToken` | List quizzes for an offering. Requires `offeringId` query param. Access: Admin; Teacher who owns the offering; Enrolled Student | ✅ |
| GET | `/:quizId` | `getQuizDetail` | `authenticateToken` | Get a quiz with questions and options (same access as list) | ✅ |
| POST | `/` | `createQuiz` | `authenticateToken`, `requireAdminOrTeacher` | Create a quiz (Admin or owning Teacher) | ✅ |
| POST | `/:quizId/questions` | `addQuestion` | `authenticateToken`, `requireAdminOrTeacher` | Add a question (and options for choice types) to a quiz (Admin or owning Teacher) | ✅ |
| DELETE | `/:quizId` | `deleteQuiz` | `authenticateToken`, `requireAdminOrTeacher` | Delete a quiz (Admin or owning Teacher) | ✅ |
| POST | `/:quizId/submit` | `submitQuiz` | `authenticateToken` | Submit answers to a quiz (Students only; must be enrolled) | ✅ |
| GET | `/submissions/:submissionId` | `getSubmission` | `authenticateToken` | Get a submission. Access: Admin; Owning Teacher of offering; The student who submitted | ✅ |

## Assignment Routes (`/assignments`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `listAssignments` | `authenticateToken` | List assignments for an offering. Requires `offeringId` query param. Access: Admin; Teacher who owns the offering; Enrolled Student | ✅ |
| GET | `/:id` | `getAssignmentById` | `authenticateToken` | Get one assignment (same access as list) | ✅ |
| POST | `/` | `createAssignment` | `authenticateToken`, `requireAdminOrTeacher` | Create an assignment (Admin or owning Teacher) | ✅ |
| PUT | `/:id` | `updateAssignment` | `authenticateToken`, `requireAdminOrTeacher` | Update an assignment (Admin or owning Teacher) | ✅ |
| DELETE | `/:id` | `deleteAssignment` | `authenticateToken`, `requireAdminOrTeacher` | Delete an assignment (Admin or owning Teacher) | ✅ |
| POST | `/:assignmentId/submit-text` | `submitAssignmentText` | `authenticateToken` | Student submits text answer; AI detection runs; if flagged as non-human, increments AI flag counter and sends notifications to teacher and student | ✅ |

Notes:
- AI detection API: POST https://laziestant-ai-text-detection.onrender.com/predict with body `{ "text": "..." }`.
- Response example: `{ "prediction": "human" | "ai", "confidence": number }`.
- If prediction != human, the system increments `ai_flags` for the student in the offering and inserts `notifications` for both teacher and student.

## Student Routes (`/students`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllStudents` | `authenticateToken`, `requireAdmin` | Get all students |✅
| GET | `/:studentId/enrollments` | `getEnrollmentByStudentId` | `authenticateToken`, `requireAdminOrTeacher` | Get enrollments by student |❎
| GET | `/:studentId/course-chat-rooms` | `getCourseChatRoomsByStudentId` | `authenticateToken`, `requireAdminOrSelf` | Get course chat rooms for student |❎
| GET | `/:studentId/academic-chat-rooms` | `getAcademicChatRoomByStudentId` | `authenticateToken`, `requireAdminOrSelf` | Get academic chat rooms for student |❎

## Teacher Routes (`/teachers`)

| Method | Endpoint | Function | Middleware | Description | IsTest |
|--------|----------|----------|------------|-------------|--------|
| GET | `/` | `getAllTeachers` | `authenticateToken`, `requireAdmin` | Get all teachers |✅
| GET | `/:teacherId/course-offerings` | `getOfferingCoursesByTeacherId` | `authenticateToken`, `requireAdminOrTeacher` | Get course offerings by teacher |❎
| GET | `/:teacherId/course-chat-rooms` | `getCourseChatRoomsByTeacherId` | `authenticateToken`, `requireAdminOrSelf` | Get course chat rooms for teacher |❎

## Access Control Summary

### Public Endpoints (No Authentication)

- `GET /auth/test-auth`
- `POST /auth/login`
- `POST /chat/notification`
- `POST /chat/announcement`

### Authenticated User Endpoints

- All GET endpoints for resources
- User profile updates (own data only)
- View announcements (list, get by id)

### Admin Only Endpoints

- User registration
- All CREATE, UPDATE, DELETE operations for:
  - Academic years
  - Courses
  - Course offerings
  - Departments
  - Majors
  - Positions
  - Enrollments
- User banning

### Admin or Teacher Endpoints

- Create/Update/Delete announcements
- Create/Update/Delete materials (Teacher limited to own course offerings)
- Create/Delete quizzes; Add questions/options (Teacher limited to own course offerings)
- Create/Update/Delete assignments (Teacher limited to own course offerings)
- Get students by academic year

### Admin or Self Endpoints

- Update user profile
- Delete user account