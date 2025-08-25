# API Routes Documentation

## Middleware Types
- `authenticateToken` - Validates JWT token
- `requireAdmin` - Requires admin role
- `requireAdminOrSelf` - Requires admin role or user accessing own data
- `requireAdminOrTeacher` - Requires admin or teacher role

## Authentication Routes (`/auth`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/test-auth` | `main` | None | Test authentication endpoint |
| POST | `/register` | `registrationUser` | `authenticateToken`, `requireAdmin` | Register new user (admin only) |
| POST | `/login` | `loginUser` | None | User login |
| POST | `/logout` | `logoutUser` | `authenticateToken` | User logout |
| DELETE | `/delete` | `deleteUser` | `authenticateToken`, `requireAdminOrSelf` | Delete user account |

## User Routes (`/users`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllUsers` | `authenticateToken` | Get all users |
| GET | `/:id` | `getUserById` | `authenticateToken` | Get user by ID |
| PUT | `/:id` | `updateUser` | `authenticateToken`, `requireAdminOrSelf` | Update user |
| PUT | `/:id/activate` | `banUser` | `authenticateToken`, `requireAdmin` | Ban user (admin only) |

## Academic Year Routes (`/academic-years`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllAcademicYears` | `authenticateToken` | Get all academic years |
| GET | `/:id` | `getAcademicYearById` | `authenticateToken` | Get academic year by ID |
| POST | `/` | `createAcademicYear` | `authenticateToken`, `requireAdmin` | Create academic year |
| PUT | `/:id` | `updateAcademicYear` | `authenticateToken`, `requireAdmin` | Update academic year |
| DELETE | `/:id` | `deleteAcademicYear` | `authenticateToken`, `requireAdmin` | Delete academic year |
| GET | `/:academicYearId/course-offerings` | `getOfferingCoursesByAcademicYearId` | `authenticateToken` | Get course offerings by academic year |
| GET | `/:academicYearId/students` | `getAllStudentsByAcademicYear` | `authenticateToken`, `requireAdminOrTeacher` | Get students by academic year |
| GET | `/:academicYearId/chat-room` | `getAcademicChatRoomByAcademicYearId` | `authenticateToken` | Get chat room by academic year |

## Course Routes (`/courses`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllCourses` | `authenticateToken` | Get all courses |
| GET | `/:id` | `getCourseById` | `authenticateToken` | Get course by ID |
| POST | `/` | `createCourse` | `authenticateToken`, `requireAdmin` | Create course |
| PUT | `/:id` | `updateCourse` | `authenticateToken`, `requireAdmin` | Update course |
| DELETE | `/:id` | `deleteCourse` | `authenticateToken`, `requireAdmin` | Delete course |

## Course Offering Routes (`/course-offerings`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllCourseOfferings` | `authenticateToken` | Get all course offerings |
| GET | `/:id` | `getCourseOfferingById` | `authenticateToken` | Get course offering by ID |
| POST | `/` | `createCourseOffering` | `authenticateToken`, `requireAdmin` | Create course offering |
| PUT | `/:id` | `updateCourseOffering` | `authenticateToken`, `requireAdmin` | Update course offering |
| DELETE | `/:id` | `deleteCourseOffering` | `authenticateToken`, `requireAdmin` | Delete course offering |

## Department Routes (`/departments`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllDepartments` | `authenticateToken` | Get all departments |
| GET | `/:id` | `getDepartmentById` | `authenticateToken` | Get department by ID |
| POST | `/` | `createDepartment` | `authenticateToken`, `requireAdmin` | Create department |
| PUT | `/:id` | `updateDepartment` | `authenticateToken`, `requireAdmin` | Update department |
| DELETE | `/:id` | `deleteDepartment` | `authenticateToken`, `requireAdmin` | Delete department |
| GET | `/:departmentId/courses` | `getCourseByDepartmentId` | `authenticateToken` | Get courses by department |
| GET | `/:departmentId/teachers` | `getTeacherByDepartmentId` | `authenticateToken` | Get teachers by department |

## Major Routes (`/majors`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllMajors` | `authenticateToken` | Get all majors |
| GET | `/:id` | `getMajorById` | `authenticateToken` | Get major by ID |
| POST | `/` | `createMajor` | `authenticateToken`, `requireAdmin` | Create major |
| PUT | `/:id` | `updateMajor` | `authenticateToken`, `requireAdmin` | Update major |
| DELETE | `/:id` | `deleteMajor` | `authenticateToken`, `requireAdmin` | Delete major |

## Position Routes (`/positions`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllPositions` | `authenticateToken` | Get all positions |
| GET | `/:id` | `getPositionById` | `authenticateToken` | Get position by ID |
| POST | `/` | `createPosition` | `authenticateToken`, `requireAdmin` | Create position |
| PUT | `/:id` | `updatePosition` | `authenticateToken`, `requireAdmin` | Update position |
| DELETE | `/:id` | `deletePosition` | `authenticateToken`, `requireAdmin` | Delete position |
| GET | `/:positionId/teachers` | `getTeachersByPositionId` | `authenticateToken` | Get teachers by position |

## Enrollment Routes (`/enrollments`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| GET | `/` | `getAllEnrollments` | `authenticateToken` | Get all enrollments |
| GET | `/:id` | `getEnrollmentById` | `authenticateToken` | Get enrollment by ID |
| POST | `/` | `createEnrollment` | `authenticateToken`, `requireAdmin` | Create enrollment |
| PUT | `/:id` | `updateEnrollment` | `authenticateToken`, `requireAdmin` | Update enrollment |
| DELETE | `/:id` | `deleteEnrollment` | `authenticateToken`, `requireAdmin` | Delete enrollment |

## Chat Routes (`/chat`)

| Method | Endpoint | Function | Middleware | Description |
|--------|----------|----------|------------|-------------|
| POST | `/notification` | `sendCourseNotification` | None | Send course notification |
| POST | `/announcement` | `broadcastAnnouncement` | None | Broadcast announcement |

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