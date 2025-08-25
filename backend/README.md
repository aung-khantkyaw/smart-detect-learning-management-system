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

Base URL: /api

## Auth

- ✅ POST /api/auth/register — Register user (admin/teacher/student depending on context)
- ✅ POST /api/auth/login — Email/username + password
- ✅ POST /api/auth/logout — Invalidate session/token
- ✅ DELETE /api/auth/delete - Delete Account by ID
<!-- - POST /api/auth/refresh — Refresh access token
- POST /api/auth/verify-email — Verify email token -->
- POST /api/auth/forgot-password — Request reset
- POST /api/auth/reset-password — Perform reset
<!-- - POST /api/auth/mfa/setup — Setup MFA (teacher/admin)
- POST /api/auth/mfa/verify — Verify MFA code -->

## Users (Admin)

- GET /api/users — List users (filter by role)
- POST /api/users — Create user (role: TEACHER/STUDENT)
- GET /api/users/:id — Get user
- PUT /api/users/:id — Update user
- DELETE /api/users/:id — Delete user
- PATCH /api/users/:id/activate — Activate/deactivate

## Courses

- GET /api/courses — List courses
- POST /api/courses — Create course (Admin/Teacher)
- GET /api/courses/:id — Get course
- PUT /api/courses/:id — Update course
- DELETE /api/courses/:id — Delete course

## Academic Years (Admin)

- GET /api/academics — List academic years
- POST /api/academics — Create academic year
- GET /api/academics/:id — Get academic year
- PUT /api/academics/:id — Update academic year
- DELETE /api/academics/:id — Delete academic year

## Course Offerings (Admin)

- GET /api/offerings — List offerings (course + academic)
- POST /api/offerings — Create offering (assign teacher)
- GET /api/offerings/:id — Get offering
- PUT /api/offerings/:id — Update offering (reassign teacher)
- DELETE /api/offerings/:id — Delete offering

## Enrollments (Admin)

- GET /api/offerings/:id/enrollments — List students
- POST /api/offerings/:id/enrollments — Enroll student(s)
- DELETE /api/offerings/:id/enrollments/:studentId — Unenroll

## Materials (Teacher)

- GET /api/offerings/:id/materials — List materials
- POST /api/offerings/:id/materials — Upload/create material
- GET /api/materials/:materialId — Get material
- PUT /api/materials/:materialId — Update
- DELETE /api/materials/:materialId — Delete
- GET /api/materials/:materialId/download — Download file

## Announcements

- GET /api/announcements — List announcements (query by scope)
- POST /api/announcements — Create (Admin/Teacher)
- GET /api/announcements/:id — Get
- PUT /api/announcements/:id — Update
- DELETE /api/announcements/:id — Delete

## Chat

- GET /api/chats/rooms?scope=(course|academic)&scopeId=... — List rooms
- POST /api/chats/rooms — Create room (Admin)
- GET /api/chats/rooms/:roomId — Get room
- GET /api/chats/rooms/:roomId/members — List members
- POST /api/chats/rooms/:roomId/members — Add member (Admin)
- DELETE /api/chats/rooms/:roomId/members/:userId — Remove member (Admin)
- GET /api/chats/rooms/:roomId/messages — List messages
- POST /api/chats/rooms/:roomId/messages — Send text/file message

## Quizzes (Teacher/Student)

- GET /api/offerings/:id/quizzes — List quizzes
- POST /api/offerings/:id/quizzes — Create quiz (Teacher)
- GET /api/quizzes/:quizId — Get quiz
- PUT /api/quizzes/:quizId — Update quiz (Teacher)
- DELETE /api/quizzes/:quizId — Delete quiz (Teacher)
- GET /api/quizzes/:quizId/questions — List questions
- POST /api/quizzes/:quizId/questions — Add question (Teacher)
- PUT /api/questions/:questionId — Update question (Teacher)
- DELETE /api/questions/:questionId — Delete question (Teacher)
- POST /api/quizzes/:quizId/submissions — Submit quiz (Student)
- GET /api/quizzes/:quizId/submissions — List submissions (Teacher)
- GET /api/submissions/:submissionId — Get submission
- POST /api/submissions/:submissionId/grade — Grade submission (Teacher)

## Assignments (Teacher/Student)

- GET /api/offerings/:id/assignments — List assignments
- POST /api/offerings/:id/assignments — Create assignment (Teacher)
- GET /api/assignments/:assignmentId — Get assignment
- PUT /api/assignments/:assignmentId — Update assignment (Teacher)
- DELETE /api/assignments/:assignmentId — Delete assignment (Teacher)
- POST /api/assignments/:assignmentId/submissions — Submit assignment (Student)
- GET /api/assignments/:assignmentId/submissions — List submissions (Teacher)
- GET /api/assignment-submissions/:id — Get submission
- POST /api/assignment-submissions/:id/grade — Grade submission (Teacher)

## Notifications

- GET /api/notifications — List my notifications
- POST /api/notifications/:id/read — Mark as read

## Admin vs Teacher vs Student capabilities

- Admin: manage users, courses, academics, offerings, enrollments, chat rooms, announcements
- Teacher: manage materials, quizzes, assignments in their offerings; view enrollments
- Student: view materials for enrolled offerings, submit quizzes/assignments, chat and download
