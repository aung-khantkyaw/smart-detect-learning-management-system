SET client_min_messages TO WARNING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_type, room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_type, room_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_course ON course_offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_ay ON course_offerings(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_offering ON enrollments(offering_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_materials_offering ON materials(offering_id);
CREATE INDEX IF NOT EXISTS idx_announcements_scope ON announcements(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_offering ON quizzes(offering_id);
CREATE INDEX IF NOT EXISTS idx_assignments_offering ON assignments(offering_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_pair ON ai_flags(offering_id, student_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_academic_year ON users(academic_year_id);

-- Drop constraints if they exist, then recreate them
ALTER TABLE academic_years 
  DROP CONSTRAINT IF EXISTS academic_year_dates,
  ADD CONSTRAINT academic_year_dates CHECK (start_date < end_date);

ALTER TABLE quizzes 
  DROP CONSTRAINT IF EXISTS quiz_time_window,
  ADD CONSTRAINT quiz_time_window CHECK (open_at IS NULL OR close_at IS NULL OR open_at < close_at);

-- Add foreign key constraint
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_academic_year_fk,
  ADD CONSTRAINT users_academic_year_fk
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL;

SET client_min_messages TO NOTICE;