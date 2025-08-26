CREATE OR REPLACE FUNCTION validate_chat_message_sender()
RETURNS TRIGGER AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF NEW.room_type = 'COURSE' THEN
    PERFORM 1 FROM course_chat_rooms WHERE id = NEW.room_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Course chat room % does not exist', NEW.room_id; END IF;
  ELSIF NEW.room_type = 'ACADEMIC' THEN
    PERFORM 1 FROM academic_chat_rooms WHERE id = NEW.room_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Academic chat room % does not exist', NEW.room_id; END IF;
  ELSE
    RAISE EXCEPTION 'Unknown room_type: %', NEW.room_type;
  END IF;

  PERFORM 1 FROM chat_members m
   WHERE m.room_type = NEW.room_type
     AND m.room_id = NEW.room_id
     AND m.user_id = NEW.sender_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender is not a member of this chat room';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_chat_message_sender ON chat_messages;
CREATE TRIGGER trg_validate_chat_message_sender
BEFORE INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION validate_chat_message_sender();
