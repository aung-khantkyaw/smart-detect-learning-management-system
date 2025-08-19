-- SDLMS extra constraints and FKs not easily expressed earlier

-- Backfill chat rooms via triggers or app code; create constraints for chat references

-- Ensure chat_members room_id points to valid room depending on type using partial FKs via triggers not native; here we just add helpful indexes
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_type, room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_type, room_id);

-- Link course_offerings to course_chat_rooms after room creation (optional soft link)
-- We'll fill room_chat_id at app time.

-- Ensure academic year date validity
ALTER TABLE academic_years
  ADD CONSTRAINT academic_year_dates CHECK (start_date < end_date);

-- Ensure quiz availability window
ALTER TABLE quizzes
  ADD CONSTRAINT quiz_time_window CHECK (open_at IS NULL OR close_at IS NULL OR open_at < close_at);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_course_offerings_course ON course_offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_ay ON course_offerings(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_offering ON enrollments(offering_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_materials_offering ON materials(offering_id);
CREATE INDEX IF NOT EXISTS idx_announcements_scope ON announcements(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_offering ON quizzes(offering_id);
CREATE INDEX IF NOT EXISTS idx_assignments_offering ON assignments(offering_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_pair ON ai_flags(offering_id, student_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
ALTER TABLE users
  ADD CONSTRAINT users_current_academic_year_fk
  FOREIGN KEY (current_academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_current_academic_year ON users(current_academic_year_id);
