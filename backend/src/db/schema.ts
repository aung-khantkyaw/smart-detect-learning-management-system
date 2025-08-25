import { pgTable, uuid, text, boolean, timestamp, pgEnum, numeric, integer, date, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// === Enums === //
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TEACHER', 'STUDENT']);
export const submissionStatusEnum = pgEnum('submission_status', ['PENDING', 'SUBMITTED', 'GRADED', 'REJECTED_AI']);
export const quizQuestionTypeEnum = pgEnum('quiz_question_type', ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SHORT_TEXT']);

// === Tables === //

// Departments table
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Positions table
export const positions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Majors table
export const majors = pgTable('majors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Academic years table
export const academicYears = pgTable('academic_years', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  // Teacher-only fields
  department_id: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
  position_id: uuid('position_id').references(() => positions.id, { onDelete: 'set null' }),
  // Student-only fields
  major_id: uuid('major_id').references(() => majors.id, { onDelete: 'set null' }),
  academic_year_id: uuid('academic_year_id').references(() => academicYears.id, { onDelete: 'set null' }),
  studentNumber: text('student_number').unique(),
  // Auth system fields
  lastLoginAt: timestamp('last_login_at'),
  accessToken: text('access_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Course offerings table
export const courseOfferings = pgTable('course_offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  roomChatId: uuid('room_chat_id'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  uniqueCourseOfferingTeacher: unique().on(table.courseId, table.academicYearId, table.teacherId)
}));

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow()
}, (table) => ({
  uniqueEnrollment: unique().on(table.offeringId, table.studentId)
}));

// Academic chat rooms table
export const academicChatRooms = pgTable('academic_chat_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }).unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Course chat rooms table
export const courseChatRooms = pgTable('course_chat_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }).unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Chat members table
export const chatMembers = pgTable('chat_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomType: text('room_type').notNull(),
  roomId: uuid('room_id').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow()
}, (table) => ({
  roomTypeCheck: check('room_type_check', sql`${table.roomType} IN ('COURSE', 'ACADEMIC')`),
  uniqueChatMember: unique().on(table.roomType, table.roomId, table.userId)
}));

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomType: text('room_type').notNull(),
  roomId: uuid('room_id').notNull(),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  roomTypeCheck: check('room_type_check', sql`${table.roomType} IN ('COURSE', 'ACADEMIC')`)
}));

// Announcements table
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  scope: text('scope').notNull(),
  scopeId: uuid('scope_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  scopeCheck: check('scope_check', sql`${table.scope} IN ('COURSE', 'ACADEMIC')`)
}));

// Materials table
export const materials = pgTable('materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  instructions: text('instructions'),
  openAt: timestamp('open_at'),
  closeAt: timestamp('close_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Quiz questions table
export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  questionType: quizQuestionTypeEnum('question_type').notNull(),
  prompt: text('prompt').notNull(),
  points: numeric('points', { precision: 6, scale: 2 }).notNull().default('1')
});

// Quiz options table
export const quizOptions = pgTable('quiz_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false)
});

// Quiz submissions table
export const quizSubmissions = pgTable('quiz_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  submittedAt: timestamp('submitted_at'),
  score: numeric('score', { precision: 8, scale: 2 }),
  status: submissionStatusEnum('status').notNull().default('PENDING')
}, (table) => ({
  uniqueQuizSubmission: unique().on(table.quizId, table.studentId)
}));

// Quiz answers table
export const quizAnswers = pgTable('quiz_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => quizSubmissions.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id, { onDelete: 'cascade' }),
  selectedOptionIds: uuid('selected_option_ids').array(),
  shortTextAnswer: text('short_text_answer')
});

// Assignments table
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  dueAt: timestamp('due_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Assignment submissions table
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  submittedAt: timestamp('submitted_at'),
  fileUrl: text('file_url'),
  textAnswer: text('text_answer'),
  aiScore: numeric('ai_score', { precision: 5, scale: 2 }),
  status: submissionStatusEnum('status').notNull().default('PENDING'),
  attemptNumber: integer('attempt_number').notNull().default(1)
}, (table) => ({
  assignmentUniqueAttempt: unique('assignment_unique_attempt').on(table.assignmentId, table.studentId, table.attemptNumber)
}));

// AI flags table
export const aiFlags = pgTable('ai_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  offeringId: uuid('offering_id').notNull().references(() => courseOfferings.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  flaggedCount: integer('flagged_count').notNull().default(0),
  lastFlaggedAt: timestamp('last_flagged_at')
}, (table) => ({
  uniqueAiFlag: unique().on(table.offeringId, table.studentId)
}));

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at')
});

// === Relations === //

export const usersRelations = relations(users, ({ many, one }) => ({
  enrollments: many(enrollments, { relationName: "offeringEnrollments" }),
  courseOfferings: many(courseOfferings),
  academicYear: one(academicYears, {
    fields: [users.academic_year_id],
    references: [academicYears.id]
  }),
  chatMessages: many(chatMessages, { relationName: "userChatMessages" }),
  notifications: many(notifications, { relationName: "userNotifications" }),
  quizSubmissions: many(quizSubmissions, { relationName: "userQuizSubmissions" }),
  assignmentSubmissions: many(assignmentSubmissions, { relationName: "userAssignmentSubmissions" })
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: 'userChatMessages'
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: 'userNotifications'
  })
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  offerings: many(courseOfferings)
}));

export const courseOfferingsRelations = relations(courseOfferings, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseOfferings.courseId],
    references: [courses.id],
  }),
  academicYear: one(academicYears, {
    fields: [courseOfferings.academicYearId],
    references: [academicYears.id],
  }),
  teacher: one(users, {
    fields: [courseOfferings.teacherId],
    references: [users.id],
  }),
  enrollments: many(enrollments, { relationName: "offeringEnrollments" }),
  materials: many(materials, { relationName: "offeringMaterials" }),
  quizzes: many(quizzes, { relationName: "offeringQuizzes" }),
  assignments: many(assignments, { relationName: "offeringAssignments" }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  offering: one(courseOfferings, {
    fields: [enrollments.offeringId],
    references: [courseOfferings.id],
    relationName: "offeringEnrollments"
  }),
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id]
  })
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  offering: one(courseOfferings, {
    fields: [quizzes.offeringId],
    references: [courseOfferings.id],
    relationName: "offeringQuizzes"
  }),
  questions: many(quizQuestions, { relationName: 'quizQuestions' }),
  submissions: many(quizSubmissions, { relationName: 'quizSubmissions' })
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
    relationName: "quizQuestions"
  }),
  options: many(quizOptions, { relationName: 'questionOptions' }),
  answers: many(quizAnswers, { relationName: 'questionAnswers' })
}));

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizOptions.questionId],
    references: [quizQuestions.id],
    relationName: 'questionOptions'
  })
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizAnswers.questionId],
    references: [quizQuestions.id],
    relationName: 'questionAnswers'
  })
}));

export const quizSubmissionsRelations = relations(quizSubmissions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizSubmissions.quizId],
    references: [quizzes.id],
    relationName: 'quizSubmissions'
  }),
  student: one(users, {
    fields: [quizSubmissions.studentId],
    references: [users.id],
    relationName: "userQuizSubmissions"
  })
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  offering: one(courseOfferings, {
    fields: [assignments.offeringId],
    references: [courseOfferings.id],
    relationName: "offeringAssignments"
  }),
  submissions: many(assignmentSubmissions, {
    relationName: "assignmentSubmissions"
  }),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
    relationName: "assignmentSubmissions"
  }),
  student: one(users, {
    fields: [assignmentSubmissions.studentId],
    references: [users.id],
    relationName: "userAssignmentSubmissions"
  }),
}));
 
export const materialsRelations = relations(materials, ({ one }) => ({
  offering: one(courseOfferings, {
    fields: [materials.offeringId],
    references: [courseOfferings.id],
    relationName: "offeringMaterials"
  }),
  creator: one(users, {
    fields: [materials.createdBy],
    references: [users.id],
  }),
}));


// === Triggers === //
