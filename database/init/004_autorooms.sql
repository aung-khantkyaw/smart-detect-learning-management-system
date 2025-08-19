-- Auto-create chat rooms for academic years and course offerings

CREATE OR REPLACE FUNCTION create_academic_chat_room()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO academic_chat_rooms (academic_year_id, name)
  VALUES (NEW.id, 'Academic ' || NEW.name)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_academic_chat_room ON academic_years;
CREATE TRIGGER trg_create_academic_chat_room
AFTER INSERT ON academic_years
FOR EACH ROW EXECUTE FUNCTION create_academic_chat_room();

CREATE OR REPLACE FUNCTION create_course_chat_room()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_id UUID;
BEGIN
  SELECT c.code || ' - ' || c.title INTO v_name FROM courses c WHERE c.id = NEW.course_id;
  INSERT INTO course_chat_rooms (id, offering_id, name)
  VALUES (uuid_generate_v4(), NEW.id, 'Course ' || coalesce(v_name, 'Room'))
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  UPDATE course_offerings SET room_chat_id = v_id WHERE id = NEW.id AND v_id IS NOT NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_course_chat_room ON course_offerings;
CREATE TRIGGER trg_create_course_chat_room
AFTER INSERT ON course_offerings
FOR EACH ROW EXECUTE FUNCTION create_course_chat_room();
