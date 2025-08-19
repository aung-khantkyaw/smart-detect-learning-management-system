-- SDLMS triggers for AI auto-reject and flagging

-- Reject assignment submissions with ai_score > 50 by setting status and increment ai_flags
CREATE OR REPLACE FUNCTION enforce_ai_policy()
RETURNS TRIGGER AS $$
DECLARE
  v_offering_id UUID;
BEGIN
  -- Determine offering for the assignment
  SELECT a.offering_id INTO v_offering_id FROM assignments a WHERE a.id = NEW.assignment_id;

  IF NEW.ai_score IS NOT NULL AND NEW.ai_score > 50 THEN
    NEW.status := 'REJECTED_AI';
    -- Upsert ai_flags
    INSERT INTO ai_flags (offering_id, student_id, flagged_count, last_flagged_at)
    VALUES (v_offering_id, NEW.student_id, 1, now())
    ON CONFLICT (offering_id, student_id) DO UPDATE
      SET flagged_count = ai_flags.flagged_count + 1,
          last_flagged_at = now();

    -- Notify student and teacher (basic fan-out using notifications table)
    INSERT INTO notifications (user_id, title, body)
    VALUES
      (NEW.student_id, 'Assignment rejected by AI detector', 'Your submission was flagged with score ' || NEW.ai_score || '%.'),
      ((SELECT teacher_id FROM course_offerings co WHERE co.id = v_offering_id), 'Student submission flagged by AI detector', 'A submission was flagged with score ' || NEW.ai_score || '%.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_ai_policy_insert ON assignment_submissions;
CREATE TRIGGER trg_enforce_ai_policy_insert
BEFORE INSERT ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION enforce_ai_policy();

DROP TRIGGER IF EXISTS trg_enforce_ai_policy_update ON assignment_submissions;
CREATE TRIGGER trg_enforce_ai_policy_update
BEFORE UPDATE ON assignment_submissions
FOR EACH ROW WHEN (NEW.ai_score IS DISTINCT FROM OLD.ai_score)
EXECUTE FUNCTION enforce_ai_policy();

-- Auto-increment attempt number per (assignment_id, student_id)
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
