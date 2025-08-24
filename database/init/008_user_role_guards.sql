CREATE OR REPLACE FUNCTION enforce_user_role_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> 'TEACHER' THEN
    IF NEW.department_id IS NOT NULL OR NEW.position_id IS NOT NULL THEN
      RAISE EXCEPTION 'department/position allowed only for TEACHER role';
    END IF;
  END IF;

  IF NEW.role <> 'STUDENT' THEN
    IF NEW.major_id IS NOT NULL OR NEW.academic_year_id IS NOT NULL OR NEW.student_number IS NOT NULL THEN
      RAISE EXCEPTION 'major/current_academic_year_id/student_number allowed only for STUDENT role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_user_role_fields ON users;
CREATE TRIGGER trg_enforce_user_role_fields
BEFORE INSERT OR UPDATE OF role, department_id, position_id, major_id, academic_year_id, student_number ON users
FOR EACH ROW EXECUTE FUNCTION enforce_user_role_fields();
