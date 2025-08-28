-- Drop the problematic triggers and function that reference ai_score
DROP TRIGGER IF EXISTS trg_enforce_ai_policy_insert ON assignment_submissions;
DROP TRIGGER IF EXISTS trg_enforce_ai_policy_update ON assignment_submissions;
DROP FUNCTION IF EXISTS enforce_ai_policy();

-- Create new AI policy function that works with the updated schema
CREATE OR REPLACE FUNCTION enforce_ai_policy()
RETURNS TRIGGER AS $$
DECLARE
  v_offering_id UUID;
BEGIN
  -- Get offering_id from assignment
  SELECT a.offering_id INTO v_offering_id FROM assignments a WHERE a.id = NEW.assignment_id;

  -- Check if there's an AI flag for this submission (from external AI detection)
  -- This will be handled by the backend controller, not the trigger
  -- For now, just return NEW without any AI score checks
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers (they will now do nothing but can be extended later)
CREATE TRIGGER trg_enforce_ai_policy_insert
BEFORE INSERT ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION enforce_ai_policy();

CREATE TRIGGER trg_enforce_ai_policy_update
BEFORE UPDATE ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION enforce_ai_policy();
