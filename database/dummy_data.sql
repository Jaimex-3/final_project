-- Exam Security System Dummy Data
-- Version: 1.0
-- Date: January 2026

-- Insert Users (password is 'Test123!' hashed with bcrypt)
-- Hash generated using: bcrypt.hashSync('Test123!', 10)
INSERT INTO users (username, password_hash, email, role, first_name, last_name) VALUES
('admin1', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'admin1@university.edu', 'ADMIN', 'John', 'Admin'),
('admin2', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'admin2@university.edu', 'ADMIN', 'Sarah', 'Manager'),
('proctor1', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor1@university.edu', 'PROCTOR', 'Michael', 'Smith'),
('proctor2', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor2@university.edu', 'PROCTOR', 'Emily', 'Johnson'),
('proctor3', '$2b$10$rXJ5YvYKz9z8YvYKz9z8YOqKz9z8YvYKz9z8YvYKz9z8YvYKz9z8Y', 'proctor3@university.edu', 'PROCTOR', 'David', 'Williams');

-- Insert Exams
INSERT INTO exams (exam_code, exam_name, exam_date, exam_time, room_location, duration_minutes, max_capacity, status, created_by) VALUES
('CS101-FINAL-2026', 'Computer Science 101 Final Exam', '2026-01-20', '09:00:00', 'Room A-101', 180, 100, 'DRAFT', 1),
('MATH201-MID-2026', 'Mathematics 201 Midterm', '2026-01-22', '14:00:00', 'Room B-205', 120, 80, 'ACTIVE', 1),
('PHYS301-FINAL-2026', 'Physics 301 Final Exam', '2026-01-25', '10:00:00', 'Room C-310', 180, 60, 'DRAFT', 2),
('CHEM101-MID-2026', 'Chemistry 101 Midterm', '2026-01-18', '13:00:00', 'Room D-102', 90, 50, 'COMPLETED', 2),
('ENG202-FINAL-2026', 'English 202 Final Exam', '2026-01-28', '11:00:00', 'Room E-201', 150, 70, 'DRAFT', 1);

-- Insert Students (50 students)
INSERT INTO students (student_number, first_name, last_name, email, registration_number, registered_photo_path) VALUES
('S001', 'Alice', 'Anderson', 'alice.anderson@student.edu', 'REG2026001', 'photos/students/S001.jpg'),
('S002', 'Bob', 'Brown', 'bob.brown@student.edu', 'REG2026002', 'photos/students/S002.jpg'),
('S003', 'Charlie', 'Clark', 'charlie.clark@student.edu', 'REG2026003', 'photos/students/S003.jpg'),
('S004', 'Diana', 'Davis', 'diana.davis@student.edu', 'REG2026004', 'photos/students/S004.jpg'),
('S005', 'Edward', 'Evans', 'edward.evans@student.edu', 'REG2026005', 'photos/students/S005.jpg'),
('S006', 'Fiona', 'Foster', 'fiona.foster@student.edu', 'REG2026006', 'photos/students/S006.jpg'),
('S007', 'George', 'Garcia', 'george.garcia@student.edu', 'REG2026007', 'photos/students/S007.jpg'),
('S008', 'Hannah', 'Harris', 'hannah.harris@student.edu', 'REG2026008', 'photos/students/S008.jpg'),
('S009', 'Ian', 'Jackson', 'ian.jackson@student.edu', 'REG2026009', 'photos/students/S009.jpg'),
('S010', 'Julia', 'Johnson', 'julia.johnson@student.edu', 'REG2026010', 'photos/students/S010.jpg'),
('S011', 'Kevin', 'King', 'kevin.king@student.edu', 'REG2026011', 'photos/students/S011.jpg'),
('S012', 'Laura', 'Lee', 'laura.lee@student.edu', 'REG2026012', 'photos/students/S012.jpg'),
('S013', 'Michael', 'Martin', 'michael.martin@student.edu', 'REG2026013', 'photos/students/S013.jpg'),
('S014', 'Nancy', 'Nelson', 'nancy.nelson@student.edu', 'REG2026014', 'photos/students/S014.jpg'),
('S015', 'Oliver', 'O\'Brien', 'oliver.obrien@student.edu', 'REG2026015', 'photos/students/S015.jpg'),
('S016', 'Patricia', 'Parker', 'patricia.parker@student.edu', 'REG2026016', 'photos/students/S016.jpg'),
('S017', 'Quentin', 'Quinn', 'quentin.quinn@student.edu', 'REG2026017', 'photos/students/S017.jpg'),
('S018', 'Rachel', 'Roberts', 'rachel.roberts@student.edu', 'REG2026018', 'photos/students/S018.jpg'),
('S019', 'Samuel', 'Smith', 'samuel.smith@student.edu', 'REG2026019', 'photos/students/S019.jpg'),
('S020', 'Tina', 'Taylor', 'tina.taylor@student.edu', 'REG2026020', 'photos/students/S020.jpg'),
('S021', 'Uma', 'Underwood', 'uma.underwood@student.edu', 'REG2026021', 'photos/students/S021.jpg'),
('S022', 'Victor', 'Valdez', 'victor.valdez@student.edu', 'REG2026022', 'photos/students/S022.jpg'),
('S023', 'Wendy', 'Walker', 'wendy.walker@student.edu', 'REG2026023', 'photos/students/S023.jpg'),
('S024', 'Xavier', 'Xu', 'xavier.xu@student.edu', 'REG2026024', 'photos/students/S024.jpg'),
('S025', 'Yolanda', 'Young', 'yolanda.young@student.edu', 'REG2026025', 'photos/students/S025.jpg'),
('S026', 'Zachary', 'Zhang', 'zachary.zhang@student.edu', 'REG2026026', 'photos/students/S026.jpg'),
('S027', 'Amy', 'Adams', 'amy.adams@student.edu', 'REG2026027', 'photos/students/S027.jpg'),
('S028', 'Brian', 'Baker', 'brian.baker@student.edu', 'REG2026028', 'photos/students/S028.jpg'),
('S029', 'Catherine', 'Campbell', 'catherine.campbell@student.edu', 'REG2026029', 'photos/students/S029.jpg'),
('S030', 'Daniel', 'Diaz', 'daniel.diaz@student.edu', 'REG2026030', 'photos/students/S030.jpg'),
('S031', 'Emma', 'Edwards', 'emma.edwards@student.edu', 'REG2026031', 'photos/students/S031.jpg'),
('S032', 'Frank', 'Fisher', 'frank.fisher@student.edu', 'REG2026032', 'photos/students/S032.jpg'),
('S033', 'Grace', 'Green', 'grace.green@student.edu', 'REG2026033', 'photos/students/S033.jpg'),
('S034', 'Henry', 'Hall', 'henry.hall@student.edu', 'REG2026034', 'photos/students/S034.jpg'),
('S035', 'Iris', 'Ingram', 'iris.ingram@student.edu', 'REG2026035', 'photos/students/S035.jpg'),
('S036', 'Jack', 'James', 'jack.james@student.edu', 'REG2026036', 'photos/students/S036.jpg'),
('S037', 'Karen', 'Kelly', 'karen.kelly@student.edu', 'REG2026037', 'photos/students/S037.jpg'),
('S038', 'Leo', 'Lewis', 'leo.lewis@student.edu', 'REG2026038', 'photos/students/S038.jpg'),
('S039', 'Maria', 'Moore', 'maria.moore@student.edu', 'REG2026039', 'photos/students/S039.jpg'),
('S040', 'Nathan', 'Nguyen', 'nathan.nguyen@student.edu', 'REG2026040', 'photos/students/S040.jpg'),
('S041', 'Olivia', 'Owens', 'olivia.owens@student.edu', 'REG2026041', 'photos/students/S041.jpg'),
('S042', 'Peter', 'Peterson', 'peter.peterson@student.edu', 'REG2026042', 'photos/students/S042.jpg'),
('S043', 'Quinn', 'Quincy', 'quinn.quincy@student.edu', 'REG2026043', 'photos/students/S043.jpg'),
('S044', 'Rose', 'Rodriguez', 'rose.rodriguez@student.edu', 'REG2026044', 'photos/students/S044.jpg'),
('S045', 'Steve', 'Scott', 'steve.scott@student.edu', 'REG2026045', 'photos/students/S045.jpg'),
('S046', 'Tracy', 'Thomas', 'tracy.thomas@student.edu', 'REG2026046', 'photos/students/S046.jpg'),
('S047', 'Ursula', 'Upton', 'ursula.upton@student.edu', 'REG2026047', 'photos/students/S047.jpg'),
('S048', 'Vincent', 'Vargas', 'vincent.vargas@student.edu', 'REG2026048', 'photos/students/S048.jpg'),
('S049', 'Willow', 'White', 'willow.white@student.edu', 'REG2026049', 'photos/students/S049.jpg'),
('S050', 'Xander', 'Xavier', 'xander.xavier@student.edu', 'REG2026050', 'photos/students/S050.jpg');

-- Insert Exam Rosters (assign students to exams)
-- CS101 Final - 30 students
INSERT INTO exam_rosters (exam_id, student_id, assigned_seat) VALUES
(1, 1, 'A1'), (1, 2, 'A2'), (1, 3, 'A3'), (1, 4, 'A4'), (1, 5, 'A5'),
(1, 6, 'B1'), (1, 7, 'B2'), (1, 8, 'B3'), (1, 9, 'B4'), (1, 10, 'B5'),
(1, 11, 'C1'), (1, 12, 'C2'), (1, 13, 'C3'), (1, 14, 'C4'), (1, 15, 'C5'),
(1, 16, 'D1'), (1, 17, 'D2'), (1, 18, 'D3'), (1, 19, 'D4'), (1, 20, 'D5'),
(1, 21, 'E1'), (1, 22, 'E2'), (1, 23, 'E3'), (1, 24, 'E4'), (1, 25, 'E5'),
(1, 26, 'F1'), (1, 27, 'F2'), (1, 28, 'F3'), (1, 29, 'F4'), (1, 30, 'F5');

-- MATH201 Midterm - 25 students
INSERT INTO exam_rosters (exam_id, student_id, assigned_seat) VALUES
(2, 5, 'A1'), (2, 6, 'A2'), (2, 7, 'A3'), (2, 8, 'A4'), (2, 9, 'A5'),
(2, 10, 'B1'), (2, 11, 'B2'), (2, 12, 'B3'), (2, 13, 'B4'), (2, 14, 'B5'),
(2, 15, 'C1'), (2, 16, 'C2'), (2, 17, 'C3'), (2, 18, 'C4'), (2, 19, 'C5'),
(2, 20, 'D1'), (2, 21, 'D2'), (2, 22, 'D3'), (2, 23, 'D4'), (2, 24, 'D5'),
(2, 25, 'E1'), (2, 26, 'E2'), (2, 27, 'E3'), (2, 28, 'E4'), (2, 29, 'E5');

-- PHYS301 Final - 20 students
INSERT INTO exam_rosters (exam_id, student_id, assigned_seat) VALUES
(3, 31, 'A1'), (3, 32, 'A2'), (3, 33, 'A3'), (3, 34, 'A4'), (3, 35, 'A5'),
(3, 36, 'B1'), (3, 37, 'B2'), (3, 38, 'B3'), (3, 39, 'B4'), (3, 40, 'B5'),
(3, 41, 'C1'), (3, 42, 'C2'), (3, 43, 'C3'), (3, 44, 'C4'), (3, 45, 'C5'),
(3, 46, 'D1'), (3, 47, 'D2'), (3, 48, 'D3'), (3, 49, 'D4'), (3, 50, 'D5');

-- Insert Seating Plans
INSERT INTO seating_plans (exam_id, plan_name, plan_type, rows, columns, total_seats, created_by) VALUES
(1, 'CS101 Final Seating', 'GRID', 6, 5, 30, 1),
(2, 'MATH201 Midterm Seating', 'GRID', 5, 5, 25, 1),
(3, 'PHYS301 Final Seating', 'GRID', 4, 5, 20, 2);

-- Insert Seats for CS101 Final (6 rows × 5 columns = 30 seats)
INSERT INTO seats (seating_plan_id, seat_code, row_number, column_number, is_occupied, occupied_by_student_id) VALUES
(1, 'A1', 1, 1, FALSE, NULL), (1, 'A2', 1, 2, FALSE, NULL), (1, 'A3', 1, 3, FALSE, NULL), (1, 'A4', 1, 4, FALSE, NULL), (1, 'A5', 1, 5, FALSE, NULL),
(1, 'B1', 2, 1, FALSE, NULL), (1, 'B2', 2, 2, FALSE, NULL), (1, 'B3', 2, 3, FALSE, NULL), (1, 'B4', 2, 4, FALSE, NULL), (1, 'B5', 2, 5, FALSE, NULL),
(1, 'C1', 3, 1, FALSE, NULL), (1, 'C2', 3, 2, FALSE, NULL), (1, 'C3', 3, 3, FALSE, NULL), (1, 'C4', 3, 4, FALSE, NULL), (1, 'C5', 3, 5, FALSE, NULL),
(1, 'D1', 4, 1, FALSE, NULL), (1, 'D2', 4, 2, FALSE, NULL), (1, 'D3', 4, 3, FALSE, NULL), (1, 'D4', 4, 4, FALSE, NULL), (1, 'D5', 4, 5, FALSE, NULL),
(1, 'E1', 5, 1, FALSE, NULL), (1, 'E2', 5, 2, FALSE, NULL), (1, 'E3', 5, 3, FALSE, NULL), (1, 'E4', 5, 4, FALSE, NULL), (1, 'E5', 5, 5, FALSE, NULL),
(1, 'F1', 6, 1, FALSE, NULL), (1, 'F2', 6, 2, FALSE, NULL), (1, 'F3', 6, 3, FALSE, NULL), (1, 'F4', 6, 4, FALSE, NULL), (1, 'F5', 6, 5, FALSE, NULL);

-- Insert Seats for MATH201 Midterm (5 rows × 5 columns = 25 seats)
INSERT INTO seats (seating_plan_id, seat_code, row_number, column_number, is_occupied, occupied_by_student_id) VALUES
(2, 'A1', 1, 1, FALSE, NULL), (2, 'A2', 1, 2, FALSE, NULL), (2, 'A3', 1, 3, FALSE, NULL), (2, 'A4', 1, 4, FALSE, NULL), (2, 'A5', 1, 5, FALSE, NULL),
(2, 'B1', 2, 1, FALSE, NULL), (2, 'B2', 2, 2, FALSE, NULL), (2, 'B3', 2, 3, FALSE, NULL), (2, 'B4', 2, 4, FALSE, NULL), (2, 'B5', 2, 5, FALSE, NULL),
(2, 'C1', 3, 1, FALSE, NULL), (2, 'C2', 3, 2, FALSE, NULL), (2, 'C3', 3, 3, FALSE, NULL), (2, 'C4', 3, 4, FALSE, NULL), (2, 'C5', 3, 5, FALSE, NULL),
(2, 'D1', 4, 1, FALSE, NULL), (2, 'D2', 4, 2, FALSE, NULL), (2, 'D3', 4, 3, FALSE, NULL), (2, 'D4', 4, 4, FALSE, NULL), (2, 'D5', 4, 5, FALSE, NULL),
(2, 'E1', 5, 1, FALSE, NULL), (2, 'E2', 5, 2, FALSE, NULL), (2, 'E3', 5, 3, FALSE, NULL), (2, 'E4', 5, 4, FALSE, NULL), (2, 'E5', 5, 5, FALSE, NULL);

-- Insert Seats for PHYS301 Final (4 rows × 5 columns = 20 seats)
INSERT INTO seats (seating_plan_id, seat_code, row_number, column_number, is_occupied, occupied_by_student_id) VALUES
(3, 'A1', 1, 1, FALSE, NULL), (3, 'A2', 1, 2, FALSE, NULL), (3, 'A3', 1, 3, FALSE, NULL), (3, 'A4', 1, 4, FALSE, NULL), (3, 'A5', 1, 5, FALSE, NULL),
(3, 'B1', 2, 1, FALSE, NULL), (3, 'B2', 2, 2, FALSE, NULL), (3, 'B3', 2, 3, FALSE, NULL), (3, 'B4', 2, 4, FALSE, NULL), (3, 'B5', 2, 5, FALSE, NULL),
(3, 'C1', 3, 1, FALSE, NULL), (3, 'C2', 3, 2, FALSE, NULL), (3, 'C3', 3, 3, FALSE, NULL), (3, 'C4', 3, 4, FALSE, NULL), (3, 'C5', 3, 5, FALSE, NULL),
(3, 'D1', 4, 1, FALSE, NULL), (3, 'D2', 4, 2, FALSE, NULL), (3, 'D3', 4, 3, FALSE, NULL), (3, 'D4', 4, 4, FALSE, NULL), (3, 'D5', 4, 5, FALSE, NULL);

-- Insert Sample Check-Ins (for MATH201 - Active exam)
INSERT INTO check_ins (exam_id, student_id, check_in_timestamp, captured_photo_path, verification_result, confidence_score, assigned_seat, actual_seat, proctor_id, notes) VALUES
(2, 5, '2026-01-22 13:45:00', 'photos/checkins/2_5_20260122_134500.jpg', 'MATCH', 95.50, 'A1', 'A1', 3, 'Smooth check-in'),
(2, 6, '2026-01-22 13:46:30', 'photos/checkins/2_6_20260122_134630.jpg', 'MATCH', 92.30, 'A2', 'A2', 3, NULL),
(2, 7, '2026-01-22 13:48:00', 'photos/checkins/2_7_20260122_134800.jpg', 'NO_MATCH', 45.20, 'A3', 'A3', 3, 'Low confidence score, manual verification required'),
(2, 8, '2026-01-22 13:49:15', 'photos/checkins/2_8_20260122_134915.jpg', 'MATCH', 88.70, 'A4', 'A4', 4, NULL),
(2, 9, '2026-01-22 13:50:30', 'photos/checkins/2_9_20260122_135030.jpg', 'OVERRIDE', 65.40, 'A5', 'A5', 4, 'Manual override - student wearing glasses'),
(2, 10, '2026-01-22 13:52:00', 'photos/checkins/2_10_20260122_135200.jpg', 'MATCH', 91.20, 'B1', 'B1', 3, NULL),
(2, 11, '2026-01-22 13:53:15', 'photos/checkins/2_11_20260122_135315.jpg', 'MATCH', 94.80, 'B2', 'B3', 3, 'Student initially sat in wrong seat'),
(2, 12, '2026-01-22 13:54:30', 'photos/checkins/2_12_20260122_135430.jpg', 'MATCH', 89.50, 'B3', 'B3', 4, NULL);

-- Insert Sample Violations
INSERT INTO violations (exam_id, student_id, violation_category, violation_timestamp, reason, severity, evidence_image_path, status, proctor_id) VALUES
(2, 7, 'IDENTITY_MISMATCH', '2026-01-22 13:48:00', 'Photo verification failed with low confidence score. Student appearance significantly different from registered photo.', 'HIGH', 'photos/violations/2_7_identity_mismatch.jpg', 'REVIEWED', 3),
(2, 11, 'SEAT_MISMATCH', '2026-01-22 13:53:15', 'Student initially sat in seat B3 instead of assigned seat B2. Corrected after proctor intervention.', 'LOW', NULL, 'RESOLVED', 3),
(2, 15, 'LATE_ARRIVAL', '2026-01-22 14:15:00', 'Student arrived 15 minutes after exam start time.', 'MEDIUM', NULL, 'RECORDED', 4),
(2, 20, 'UNAUTHORIZED_MATERIALS', '2026-01-22 14:30:00', 'Student found with unauthorized calculator. Item confiscated.', 'HIGH', 'photos/violations/2_20_unauthorized_calc.jpg', 'REVIEWED', 4),
(2, 23, 'DISRUPTIVE_BEHAVIOR', '2026-01-22 14:45:00', 'Student talking to neighboring student during exam.', 'MEDIUM', NULL, 'RESOLVED', 3);

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address) VALUES
(1, 'LOGIN', 'USER', 1, NULL, NULL, '192.168.1.100'),
(1, 'CREATE_EXAM', 'EXAM', 1, NULL, '{"exam_code":"CS101-FINAL-2026","status":"DRAFT"}', '192.168.1.100'),
(1, 'IMPORT_ROSTER', 'EXAM_ROSTER', 1, NULL, '{"exam_id":1,"students_count":30}', '192.168.1.100'),
(3, 'LOGIN', 'USER', 3, NULL, NULL, '192.168.1.105'),
(3, 'CHECK_IN_STUDENT', 'CHECK_IN', 1, NULL, '{"student_id":5,"result":"MATCH"}', '192.168.1.105'),
(3, 'RECORD_VIOLATION', 'VIOLATION', 1, NULL, '{"student_id":7,"category":"IDENTITY_MISMATCH"}', '192.168.1.105'),
(4, 'LOGIN', 'USER', 4, NULL, NULL, '192.168.1.106'),
(4, 'CHECK_IN_STUDENT', 'CHECK_IN', 4, NULL, '{"student_id":8,"result":"MATCH"}', '192.168.1.106'),
(2, 'UPDATE_EXAM_STATUS', 'EXAM', 2, '{"status":"DRAFT"}', '{"status":"ACTIVE"}', '192.168.1.101'),
(1, 'GENERATE_REPORT', 'REPORT', NULL, NULL, '{"type":"CHECK_IN","exam_id":2}', '192.168.1.100');
