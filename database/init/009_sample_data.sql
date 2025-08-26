-- Sample data for testing
INSERT INTO courses (code, title, description) VALUES
('CST-1442', 'Physics Fundamentals', 'Introduction to basic physics concepts and principles'),
('CST-1443', 'Mathematics for Computer Science', 'Mathematical foundations for computer science students')
ON CONFLICT (code) DO NOTHING;