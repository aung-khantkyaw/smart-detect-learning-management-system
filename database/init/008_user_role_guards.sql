-- Enforce teacher/student-only fields in users table

CREATE OR REPLACE FUNCTION enforce_user_role_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Teacher-only fields must be NULL unless role is TEACHER
  IF NEW.role <> 'TEACHER' THEN
    IF NEW.department IS NOT NULL OR NEW.position IS NOT NULL THEN
      RAISE EXCEPTION 'department/position allowed only for TEACHER role';
    END IF;
  END IF;

  -- Student-only fields must be NULL unless role is STUDENT
  IF NEW.role <> 'STUDENT' THEN
    IF NEW.major IS NOT NULL OR NEW.current_academic_year_id IS NOT NULL OR NEW.student_number IS NOT NULL THEN
      RAISE EXCEPTION 'major/current_academic_year_id/student_number allowed only for STUDENT role';
    END IF;
  END IF;

  -- For STUDENT, student_number recommended; keep optional to allow onboarding flexibility
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_user_role_fields ON users;
CREATE TRIGGER trg_enforce_user_role_fields
BEFORE INSERT OR UPDATE OF role, department, position, major, current_academic_year_id, student_number ON users
FOR EACH ROW EXECUTE FUNCTION enforce_user_role_fields();
