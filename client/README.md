# SDLMS Client Screen List

This document lists the main screens/pages for the Student Digital Learning Management System (SDLMS) client app. Use this as a reference for frontend development and navigation planning.

## Auth
- Login
<!-- - Register (Student/Teacher) -->
- Forgot Password
- Reset Password
<!-- - Email Verification -->

## Common
- Dashboard (role-based)
- Profile (view/edit, change password)
- Notifications
- 404 / Error

## Admin Screens
- User Management
  - List Users (filter by role)
  - Create/Edit User (Teacher/Student)
  - User Details
- Course Management
  - List Courses
  - Create/Edit Course
  - Course Details
- Academic Year Management
  - List Academic Years
  - Create/Edit Academic Year
  - Academic Year Details
- Course Offering Management
  - List Offerings
  - Create/Edit Offering (assign teacher)
  - Offering Details
- Enrollment Management
  - Enroll/Unenroll Students
- Announcement Management
  - List/Create/Edit Announcements
- Chat Room Management
  - List/Create Chat Rooms
  - Manage Room Members

## Teacher Screens
- My Courses (as teacher)
  - Course Overview
  - Materials (upload/manage)
  - Students (enrolled list)
  - Announcements
  - Chat Room (course)
  - Quizzes (CRUD, grade)
  - Assignments (CRUD, grade, AI check results)
- Profile
- Notifications

## Student Screens
- My Courses (enrolled)
  - Course Overview
  - Materials (view/download)
  - Announcements
  - Chat Room (course)
  - Quizzes (take/view results)
  - Assignments (submit/view results, AI check feedback)
- Academic Year Chat Room
- Profile
- Notifications

## Chat
- Chat Room List (by course/academic year)
- Chat Room (messages, file upload)

## Other
- Settings (theme, language, etc.)
- Help/Support

---

Adjust or expand this list as your UI/UX design evolves.
