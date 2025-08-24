CREATE OR REPLACE FUNCTION ensure_teacher_role()
RETURNS TRIGGER AS $$
DECLARE v_role user_role; BEGIN
  SELECT role INTO v_role FROM users WHERE id = NEW.teacher_id;
  IF v_role IS DISTINCT FROM 'TEACHER' THEN
    RAISE EXCEPTION 'teacher_id must reference a TEACHER user (got %)', v_role;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_teacher_role_insert ON course_offerings;
CREATE TRIGGER trg_ensure_teacher_role_insert
BEFORE INSERT OR UPDATE OF teacher_id ON course_offerings
FOR EACH ROW EXECUTE FUNCTION ensure_teacher_role();

CREATE OR REPLACE FUNCTION ensure_student_role()
RETURNS TRIGGER AS $$
DECLARE v_role user_role; BEGIN
  SELECT role INTO v_role FROM users WHERE id = NEW.student_id;
  IF v_role IS DISTINCT FROM 'STUDENT' THEN
    RAISE EXCEPTION 'student_id must reference a STUDENT user (got %)', v_role;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_student_role_insert ON enrollments;
CREATE TRIGGER trg_ensure_student_role_insert
BEFORE INSERT OR UPDATE OF student_id ON enrollments
FOR EACH ROW EXECUTE FUNCTION ensure_student_role();

CREATE OR REPLACE FUNCTION validate_chat_membership()
RETURNS TRIGGER AS $$
DECLARE
  v_exists BOOLEAN;
  v_offering_id UUID;
  v_teacher_id UUID;
  v_ay_id UUID;
  v_user_role user_role;
BEGIN
  IF NEW.room_type = 'COURSE' THEN
    SELECT TRUE INTO v_exists FROM course_chat_rooms WHERE id = NEW.room_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Course chat room % does not exist', NEW.room_id; END IF;

    SELECT o.offering_id, o2.teacher_id INTO v_offering_id, v_teacher_id
    FROM course_chat_rooms o
    JOIN course_offerings o2 ON o2.id = o.offering_id
    WHERE o.id = NEW.room_id;

    IF NEW.user_id <> v_teacher_id THEN
      PERFORM 1 FROM enrollments e WHERE e.offering_id = v_offering_id AND e.student_id = NEW.user_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'User is not enrolled nor teacher for this course room'; END IF;
    END IF;
  ELSIF NEW.room_type = 'ACADEMIC' THEN

    SELECT TRUE INTO v_exists FROM academic_chat_rooms WHERE id = NEW.room_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Academic chat room % does not exist', NEW.room_id; END IF;

    SELECT role INTO v_user_role FROM users WHERE id = NEW.user_id;
    IF v_user_role IS DISTINCT FROM 'STUDENT' THEN
      RAISE EXCEPTION 'Only STUDENT users allowed in academic chat rooms';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown room_type: %', NEW.room_type;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_chat_membership ON chat_members;
CREATE TRIGGER trg_validate_chat_membership
BEFORE INSERT OR UPDATE ON chat_members
FOR EACH ROW EXECUTE FUNCTION validate_chat_membership();
