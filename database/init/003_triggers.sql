-- AI policy trigger removed since ai_score field was removed from assignment_submissions

CREATE OR REPLACE FUNCTION set_assignment_attempt_number()
RETURNS TRIGGER AS $$
DECLARE
  v_next INT;
BEGIN
  SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_next
  FROM assignment_submissions
  WHERE assignment_id = NEW.assignment_id AND student_id = NEW.student_id;
  NEW.attempt_number := v_next;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_assignment_attempt_number ON assignment_submissions;
CREATE TRIGGER trg_set_assignment_attempt_number
BEFORE INSERT ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION set_assignment_attempt_number();
