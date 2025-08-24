CREATE OR REPLACE FUNCTION add_chat_member(p_room_type TEXT, p_room_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_members (room_type, room_id, user_id)
  VALUES (p_room_type, p_room_id, p_user_id)
  ON CONFLICT (room_type, room_id, user_id) DO NOTHING;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_course_chat_members_on_offering()
RETURNS TRIGGER AS $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT id INTO v_room_id FROM course_chat_rooms WHERE offering_id = NEW.id;
  IF v_room_id IS NOT NULL THEN
    PERFORM add_chat_member('COURSE', v_room_id, NEW.teacher_id);
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_course_chat_members_on_offering ON course_offerings;
CREATE TRIGGER trg_sync_course_chat_members_on_offering
AFTER INSERT ON course_offerings
FOR EACH ROW EXECUTE FUNCTION sync_course_chat_members_on_offering();

CREATE OR REPLACE FUNCTION add_student_to_course_chat()
RETURNS TRIGGER AS $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT id INTO v_room_id FROM course_chat_rooms WHERE offering_id = NEW.offering_id;
  IF v_room_id IS NOT NULL THEN
    PERFORM add_chat_member('COURSE', v_room_id, NEW.student_id);
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_add_student_to_course_chat ON enrollments;
CREATE TRIGGER trg_add_student_to_course_chat
AFTER INSERT ON enrollments
FOR EACH ROW EXECUTE FUNCTION add_student_to_course_chat();

CREATE OR REPLACE FUNCTION add_students_to_academic_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_members (room_type, room_id, user_id)
  SELECT 'ACADEMIC', NEW.id, e.student_id
  FROM enrollments e
  JOIN course_offerings o ON o.id = e.offering_id
  WHERE o.academic_year_id = NEW.academic_year_id
  ON CONFLICT (room_type, room_id, user_id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_add_students_to_academic_chat ON academic_chat_rooms;
CREATE TRIGGER trg_add_students_to_academic_chat
AFTER INSERT ON academic_chat_rooms
FOR EACH ROW EXECUTE FUNCTION add_students_to_academic_chat();
