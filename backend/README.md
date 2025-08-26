# SDLMS Backend API Routes

## Backend Setup

- **Framework:** Express.js (Node.js runtime)
- **Database:** PostgreSQL (managed via Docker)
- **ORM:** Drizzle ORM (type-safe, works well with Postgres and TypeScript)
- **Package Manager:** npm
- **Real-time:** Socket.IO (for chat, notifications, live updates)
- **Auth:** JWT (without refresh tokens), bcrypt for password hashing
- **Validation:** Zod for request validation
- **Environment:** dotenv for config, nodemon for dev reloads
- **Testing:** Vitest or Jest
- **API Docs:** Swagger (OpenAPI) via swagger-jsdoc or Redocly
- **File Uploads:** Multer (for local uploads), Cloudinary (for cloud storage of files/images)
- **Mailer:** Nodemailer (SMTP, Gmail, or transactional email provider)
- **CORS/Security:** helmet, cors, rate-limiter-flexible
- **Logging:** pino or winston

**Project Structure Suggestion**
```text
backend/
	src/
		controllers/
		db/             # Drizzle config, migrations
		middlewares/
		routes/
		services/
		utils/
		app.ts
		server.ts
	tests/
	uploads/
	.env
	package.json
	README.md
```

**Advice**
- Use TypeScript for type safety and better Drizzle integration.
- Keep Docker Compose for Postgres and add a service for the backend if you want to run both together.
- Use Drizzle’s migration system for schema changes.
- For real-time, namespace Socket.IO for chat vs. notifications.
- Use a layered approach: controllers (route handlers), services (business logic), models (Drizzle schemas), and middlewares (auth, validation).
- Document your API with Swagger and keep your README up to date with setup and run instructions.
- Use Cloudinary's Node SDK for file uploads; store returned URLs in your database (e.g., for materials, chat attachments). File upload endpoints (e.g., POST /api/offerings/:id/materials, POST /api/chats/rooms/:roomId/messages) should upload to Cloudinary and return the file URL.
- Use Nodemailer for sending emails (verification, password reset, notifications); configure with environment variables for SMTP or a transactional provider (e.g., SendGrid, Mailgun).

This document outlines the planned API endpoints and core functions for Admin, Teacher, and Student features.

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

- Get students by academic year

### Admin or Self Endpoints

- Update user profile
- Delete user account

## Admin vs Teacher vs Student capabilities

- Admin: manage users, courses, academics, offerings, enrollments, chat rooms, announcements
- Teacher: manage materials, quizzes, assignments in their offerings; view enrollments
- Student: view materials for enrolled offerings, submit quizzes/assignments, chat and download
