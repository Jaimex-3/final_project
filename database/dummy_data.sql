-- Exam Security System Dummy Data (schema v2)
-- Date: January 2026

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data for idempotent import (use DELETE to avoid FK issues when tools ignore FK checks)
DELETE FROM audit_logs;
DELETE FROM violations;
DELETE FROM check_ins;
DELETE FROM seat_assignments;
DELETE FROM seating_plans;
DELETE FROM exam_rosters;
DELETE FROM students;
DELETE FROM exams;
DELETE FROM rooms;
DELETE FROM users;

-- Reset auto-increment counters
ALTER TABLE audit_logs AUTO_INCREMENT = 1;
ALTER TABLE violations AUTO_INCREMENT = 1;
ALTER TABLE check_ins AUTO_INCREMENT = 1;
ALTER TABLE seat_assignments AUTO_INCREMENT = 1;
ALTER TABLE seating_plans AUTO_INCREMENT = 1;
ALTER TABLE exam_rosters AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE exams AUTO_INCREMENT = 1;
ALTER TABLE rooms AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Insert Rooms
INSERT INTO rooms (room_code, room_name, building, floor, capacity, has_camera) VALUES
('A-101', 'Auditorium 101', 'Main', 1, 100, TRUE),
('B-205', 'Lecture Hall 205', 'Science', 2, 80, TRUE),
('C-310', 'Physics Lab 310', 'Engineering', 3, 60, FALSE),
('D-102', 'Chemistry Room 102', 'Science', 1, 50, FALSE),
('E-201', 'English Hall 201', 'Arts', 2, 70, FALSE);

-- Insert Users (password is 'Test123!' hashed with bcrypt)
-- Hash generated using: bcrypt.hashSync('Test123!', 10)
INSERT INTO users (username, password_hash, email, role, full_name, phone, is_active) VALUES
('admin1', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'admin1@university.edu', 'ADMIN', 'John Admin', '+1-555-1001', TRUE),
('admin2', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'admin2@university.edu', 'ADMIN', 'Sarah Manager', '+1-555-1002', TRUE),
('proctor1', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor1@university.edu', 'PROCTOR', 'Michael Smith', '+1-555-2001', TRUE),
('proctor2', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor2@university.edu', 'PROCTOR', 'Emily Johnson', '+1-555-2002', TRUE),
('proctor3', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor3@university.edu', 'PROCTOR', 'David Williams', '+1-555-2003', TRUE);

-- Insert Exams (aligns with schema v2)
INSERT INTO exams (exam_code, exam_name, exam_date, start_time, end_time, duration_minutes, room_id, status, created_by) VALUES
('CS101-FINAL-2026', 'Computer Science 101 Final Exam', '2026-01-20', '09:00:00', '12:00:00', 180, 1, 'DRAFT', 1),
('MATH201-MID-2026', 'Mathematics 201 Midterm', '2026-01-22', '14:00:00', '16:00:00', 120, 2, 'ACTIVE', 1),
('PHYS301-FINAL-2026', 'Physics 301 Final Exam', '2026-01-25', '10:00:00', '13:00:00', 180, 3, 'DRAFT', 2),
('CHEM101-MID-2026', 'Chemistry 101 Midterm', '2026-01-18', '13:00:00', '14:30:00', 90, 4, 'COMPLETED', 2),
('ENG202-FINAL-2026', 'English 202 Final Exam', '2026-01-28', '11:00:00', '13:30:00', 150, 5, 'DRAFT', 1);

-- Insert Students (50 students) with optional fields aligned to schema v2
INSERT INTO students (student_number, first_name, last_name, email, phone, enrollment_year, major, registered_photo_path) VALUES
('S001', 'Alice', 'Anderson', 'alice.anderson@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S001.jpg'),
('S002', 'Bob', 'Brown', 'bob.brown@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S002.jpg'),
('S003', 'Charlie', 'Clark', 'charlie.clark@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S003.jpg'),
('S004', 'Diana', 'Davis', 'diana.davis@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S004.jpg'),
('S005', 'Edward', 'Evans', 'edward.evans@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S005.jpg'),
('S006', 'Fiona', 'Foster', 'fiona.foster@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S006.jpg'),
('S007', 'George', 'Garcia', 'george.garcia@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S007.jpg'),
('S008', 'Hannah', 'Harris', 'hannah.harris@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S008.jpg'),
('S009', 'Ian', 'Jackson', 'ian.jackson@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S009.jpg'),
('S010', 'Julia', 'Johnson', 'julia.johnson@student.edu', NULL, 2022, 'Computer Science', 'photos/students/S010.jpg'),
('S011', 'Kevin', 'King', 'kevin.king@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S011.jpg'),
('S012', 'Laura', 'Lee', 'laura.lee@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S012.jpg'),
('S013', 'Michael', 'Martin', 'michael.martin@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S013.jpg'),
('S014', 'Nancy', 'Nelson', 'nancy.nelson@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S014.jpg'),
('S015', 'Oliver', 'O''Brien', 'oliver.obrien@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S015.jpg'),
('S016', 'Patricia', 'Parker', 'patricia.parker@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S016.jpg'),
('S017', 'Quentin', 'Quinn', 'quentin.quinn@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S017.jpg'),
('S018', 'Rachel', 'Roberts', 'rachel.roberts@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S018.jpg'),
('S019', 'Samuel', 'Smith', 'samuel.smith@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S019.jpg'),
('S020', 'Tina', 'Taylor', 'tina.taylor@student.edu', NULL, 2022, 'Mathematics', 'photos/students/S020.jpg'),
('S021', 'Uma', 'Underwood', 'uma.underwood@student.edu', NULL, 2022, 'Physics', 'photos/students/S021.jpg'),
('S022', 'Victor', 'Valdez', 'victor.valdez@student.edu', NULL, 2022, 'Physics', 'photos/students/S022.jpg'),
('S023', 'Wendy', 'Walker', 'wendy.walker@student.edu', NULL, 2022, 'Physics', 'photos/students/S023.jpg'),
('S024', 'Xavier', 'Xu', 'xavier.xu@student.edu', NULL, 2022, 'Physics', 'photos/students/S024.jpg'),
('S025', 'Yolanda', 'Young', 'yolanda.young@student.edu', NULL, 2022, 'Physics', 'photos/students/S025.jpg'),
('S026', 'Zachary', 'Zhang', 'zachary.zhang@student.edu', NULL, 2022, 'Physics', 'photos/students/S026.jpg'),
('S027', 'Amy', 'Adams', 'amy.adams@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S027.jpg'),
('S028', 'Brian', 'Baker', 'brian.baker@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S028.jpg'),
('S029', 'Catherine', 'Campbell', 'catherine.campbell@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S029.jpg'),
('S030', 'Daniel', 'Diaz', 'daniel.diaz@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S030.jpg'),
('S031', 'Emma', 'Edwards', 'emma.edwards@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S031.jpg'),
('S032', 'Frank', 'Fisher', 'frank.fisher@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S032.jpg'),
('S033', 'Grace', 'Green', 'grace.green@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S033.jpg'),
('S034', 'Henry', 'Hall', 'henry.hall@student.edu', NULL, 2022, 'Chemistry', 'photos/students/S034.jpg'),
('S035', 'Iris', 'Ingram', 'iris.ingram@student.edu', NULL, 2022, 'English', 'photos/students/S035.jpg'),
('S036', 'Jack', 'James', 'jack.james@student.edu', NULL, 2022, 'English', 'photos/students/S036.jpg'),
('S037', 'Karen', 'Kelly', 'karen.kelly@student.edu', NULL, 2022, 'English', 'photos/students/S037.jpg'),
('S038', 'Leo', 'Lewis', 'leo.lewis@student.edu', NULL, 2022, 'English', 'photos/students/S038.jpg'),
('S039', 'Maria', 'Moore', 'maria.moore@student.edu', NULL, 2022, 'English', 'photos/students/S039.jpg'),
('S040', 'Nathan', 'Nguyen', 'nathan.nguyen@student.edu', NULL, 2022, 'English', 'photos/students/S040.jpg'),
('S041', 'Olivia', 'Owens', 'olivia.owens@student.edu', NULL, 2022, 'English', 'photos/students/S041.jpg'),
('S042', 'Peter', 'Peterson', 'peter.peterson@student.edu', NULL, 2022, 'English', 'photos/students/S042.jpg'),
('S043', 'Quinn', 'Quincy', 'quinn.quincy@student.edu', NULL, 2022, 'English', 'photos/students/S043.jpg'),
('S044', 'Rose', 'Rodriguez', 'rose.rodriguez@student.edu', NULL, 2022, 'English', 'photos/students/S044.jpg'),
('S045', 'Steve', 'Scott', 'steve.scott@student.edu', NULL, 2022, 'English', 'photos/students/S045.jpg'),
('S046', 'Tracy', 'Thomas', 'tracy.thomas@student.edu', NULL, 2022, 'English', 'photos/students/S046.jpg'),
('S047', 'Ursula', 'Upton', 'ursula.upton@student.edu', NULL, 2022, 'English', 'photos/students/S047.jpg'),
('S048', 'Vincent', 'Vargas', 'vincent.vargas@student.edu', NULL, 2022, 'English', 'photos/students/S048.jpg'),
('S049', 'Willow', 'White', 'willow.white@student.edu', NULL, 2022, 'English', 'photos/students/S049.jpg'),
('S050', 'Xander', 'Xavier', 'xander.xavier@student.edu', NULL, 2022, 'English', 'photos/students/S050.jpg');

-- Exam Rosters (assign students to exams)
INSERT INTO exam_rosters (exam_id, student_id, assigned_seat) VALUES
(1, 1, 'A1'), (1, 2, 'A2'), (1, 3, 'A3'), (1, 4, 'A4'), (1, 5, 'A5'),
(1, 6, 'B1'), (1, 7, 'B2'), (1, 8, 'B3'), (1, 9, 'B4'), (1, 10, 'B5'),
(2, 11, 'A1'), (2, 12, 'A2'), (2, 13, 'A3'), (2, 14, 'A4'), (2, 15, 'A5'),
(2, 16, 'B1'), (2, 17, 'B2'), (2, 18, 'B3'), (2, 19, 'B4'), (2, 20, 'B5');

-- Seating Plans (GRID)
INSERT INTO seating_plans (exam_id, room_id, total_rows, total_columns, layout_type, created_by) VALUES
(1, 1, 6, 5, 'GRID', 1),
(2, 2, 5, 5, 'GRID', 1);

-- Seat Assignments (replaces seats table)
INSERT INTO seat_assignments (seating_plan_id, student_id, seat_code, row_number, column_number) VALUES
(1, 1, 'A1', 1, 1), (1, 2, 'A2', 1, 2), (1, 3, 'A3', 1, 3), (1, 4, 'A4', 1, 4), (1, 5, 'A5', 1, 5),
(1, 6, 'B1', 2, 1), (1, 7, 'B2', 2, 2), (1, 8, 'B3', 2, 3), (1, 9, 'B4', 2, 4), (1, 10, 'B5', 2, 5),
(2, 11, 'A1', 1, 1), (2, 12, 'A2', 1, 2), (2, 13, 'A3', 1, 3), (2, 14, 'A4', 1, 4), (2, 15, 'A5', 1, 5),
(2, 16, 'B1', 2, 1), (2, 17, 'B2', 2, 2), (2, 18, 'B3', 2, 3), (2, 19, 'B4', 2, 4), (2, 20, 'B5', 2, 5);

-- Sample Check-Ins (align with schema v2)
INSERT INTO check_ins (exam_id, student_id, proctor_id, check_in_time, captured_photo_path, verification_result, confidence_score, assigned_seat, actual_seat, seat_match, notes) VALUES
(2, 11, 3, '2026-01-22 13:45:00', 'photos/checkins/2_11.jpg', 'MATCH', 95.50, 'A1', 'A1', TRUE, 'Smooth check-in'),
(2, 12, 3, '2026-01-22 13:46:30', 'photos/checkins/2_12.jpg', 'MATCH', 92.30, 'A2', 'A2', TRUE, NULL),
(2, 13, 3, '2026-01-22 13:48:00', 'photos/checkins/2_13.jpg', 'NO_MATCH', 45.20, 'A3', 'A3', TRUE, 'Low confidence score, manual verification required'),
(2, 14, 4, '2026-01-22 13:49:15', 'photos/checkins/2_14.jpg', 'MATCH', 88.70, 'A4', 'A4', TRUE, NULL),
(2, 15, 4, '2026-01-22 13:50:30', 'photos/checkins/2_15.jpg', 'OVERRIDE', 65.40, 'A5', 'A5', TRUE, 'Manual override - student wearing glasses'),
(2, 16, 3, '2026-01-22 13:52:00', 'photos/checkins/2_16.jpg', 'MATCH', 91.20, 'B1', 'B1', TRUE, NULL),
(2, 17, 3, '2026-01-22 13:53:15', 'photos/checkins/2_17.jpg', 'MATCH', 94.80, 'B2', 'B3', FALSE, 'Student initially sat in wrong seat'),
(2, 18, 4, '2026-01-22 13:54:30', 'photos/checkins/2_18.jpg', 'MATCH', 89.50, 'B3', 'B3', TRUE, NULL);

-- Sample Violations (schema v2)
INSERT INTO violations (check_in_id, exam_id, student_id, reported_by, violation_type, severity, description, evidence_photo_path, reported_at, status, resolution_notes, resolved_by) VALUES
(3, 2, 13, 3, 'IDENTITY_MISMATCH', 'HIGH', 'Photo verification failed with low confidence score.', 'photos/violations/2_13_identity.jpg', '2026-01-22 13:48:00', 'REVIEWED', NULL, NULL),
(7, 2, 17, 3, 'SEAT_MISMATCH', 'LOW', 'Student initially sat in seat B3 instead of assigned seat B2.', NULL, '2026-01-22 13:53:15', 'RESOLVED', 'Seat corrected during check-in.', 1),
(5, 2, 15, 4, 'LATE_ARRIVAL', 'MEDIUM', 'Student arrived 15 minutes after exam start time.', NULL, '2026-01-22 14:15:00', 'RECORDED', NULL, NULL),
(6, 2, 16, 4, 'UNAUTHORIZED_MATERIALS', 'HIGH', 'Unauthorized calculator confiscated.', 'photos/violations/2_16_calc.jpg', '2026-01-22 14:30:00', 'REVIEWED', NULL, NULL),
(8, 2, 18, 3, 'DISRUPTIVE_BEHAVIOR', 'MEDIUM', 'Talking to neighboring student during exam.', NULL, '2026-01-22 14:45:00', 'RESOLVED', 'Warning issued.', 2);

-- Sample Audit Logs (schema v2)
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_value, new_value, ip_address) VALUES
(1, 'LOGIN', 'users', 1, NULL, NULL, '192.168.1.100'),
(1, 'CREATE_EXAM', 'exams', 1, NULL, '{"exam_code":"CS101-FINAL-2026","status":"DRAFT"}', '192.168.1.100'),
(1, 'IMPORT_ROSTER', 'exam_rosters', 1, NULL, '{"exam_id":1,"students_count":10}', '192.168.1.100'),
(3, 'CHECK_IN_STUDENT', 'check_ins', 1, NULL, '{"student_id":11,"result":"MATCH"}', '192.168.1.105'),
(3, 'RECORD_VIOLATION', 'violations', 1, NULL, '{"student_id":13,"type":"IDENTITY_MISMATCH"}', '192.168.1.105'),
(4, 'CHECK_IN_STUDENT', 'check_ins', 4, NULL, '{"student_id":14,"result":"MATCH"}', '192.168.1.106'),
(2, 'UPDATE_EXAM_STATUS', 'exams', 2, '{"status":"DRAFT"}', '{"status":"ACTIVE"}', '192.168.1.101'),
(1, 'GENERATE_REPORT', 'reports', NULL, NULL, '{"type":"CHECK_IN","exam_id":2}', '192.168.1.100');

SET FOREIGN_KEY_CHECKS = 1;
