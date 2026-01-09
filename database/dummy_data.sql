USE exam_security;

-- Roles
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'System administrator'),
    (2, 'proctor', 'Exam proctor');

-- Users
INSERT INTO users (id, role_id, email, full_name, password_hash, is_active) VALUES
    (1, 1, 'admin@example.com', 'Admin User', '$pbkdf2-sha256$demo$admin', 1),
    (2, 2, 'proctor1@example.com', 'Proctor One', '$pbkdf2-sha256$demo$proctor1', 1),
    (3, 2, 'proctor2@example.com', 'Proctor Two', '$pbkdf2-sha256$demo$proctor2', 1);

-- Students
INSERT INTO students (id, student_number, full_name, email) VALUES
    (1, 'S0001', 'Student 1', 's0001@example.edu'),
    (2, 'S0002', 'Student 2', 's0002@example.edu'),
    (3, 'S0003', 'Student 3', 's0003@example.edu'),
    (4, 'S0004', 'Student 4', 's0004@example.edu'),
    (5, 'S0005', 'Student 5', 's0005@example.edu'),
    (6, 'S0006', 'Student 6', 's0006@example.edu'),
    (7, 'S0007', 'Student 7', 's0007@example.edu'),
    (8, 'S0008', 'Student 8', 's0008@example.edu'),
    (9, 'S0009', 'Student 9', 's0009@example.edu'),
    (10, 'S0010', 'Student 10', 's0010@example.edu'),
    (11, 'S0011', 'Student 11', 's0011@example.edu'),
    (12, 'S0012', 'Student 12', 's0012@example.edu'),
    (13, 'S0013', 'Student 13', 's0013@example.edu'),
    (14, 'S0014', 'Student 14', 's0014@example.edu'),
    (15, 'S0015', 'Student 15', 's0015@example.edu'),
    (16, 'S0016', 'Student 16', 's0016@example.edu'),
    (17, 'S0017', 'Student 17', 's0017@example.edu'),
    (18, 'S0018', 'Student 18', 's0018@example.edu'),
    (19, 'S0019', 'Student 19', 's0019@example.edu'),
    (20, 'S0020', 'Student 20', 's0020@example.edu');

-- Rooms
INSERT INTO rooms (id, name, capacity, location) VALUES
    (1, 'Room A', 40, 'Building 1');

-- Exams
INSERT INTO exams (id, code, title, description, room_id, start_at, end_at, created_by) VALUES
    (1, 'EXAM101', 'Calculus Midterm', 'Spring session midterm', 1, '2024-06-01 09:00:00', '2024-06-01 11:00:00', 1);

-- Seating plan
INSERT INTO seating_plans (id, exam_id, room_id, name, created_by) VALUES
    (1, 1, 1, 'Main Plan', 2);

-- Seats for the seating plan (4 rows x 5 columns = 20 seats)
INSERT INTO seats (id, seating_plan_id, seat_code, row_number, col_number) VALUES
    (1, 1, 'A1', 1, 1), (2, 1, 'A2', 1, 2), (3, 1, 'A3', 1, 3), (4, 1, 'A4', 1, 4), (5, 1, 'A5', 1, 5),
    (6, 1, 'B1', 2, 1), (7, 1, 'B2', 2, 2), (8, 1, 'B3', 2, 3), (9, 1, 'B4', 2, 4), (10, 1, 'B5', 2, 5),
    (11, 1, 'C1', 3, 1), (12, 1, 'C2', 3, 2), (13, 1, 'C3', 3, 3), (14, 1, 'C4', 3, 4), (15, 1, 'C5', 3, 5),
    (16, 1, 'D1', 4, 1), (17, 1, 'D2', 4, 2), (18, 1, 'D3', 4, 3), (19, 1, 'D4', 4, 4), (20, 1, 'D5', 4, 5);

-- Exam roster
INSERT INTO exam_students (exam_id, student_id, status) VALUES
    (1, 1, 'enrolled'), (1, 2, 'enrolled'), (1, 3, 'enrolled'), (1, 4, 'enrolled'), (1, 5, 'enrolled'),
    (1, 6, 'enrolled'), (1, 7, 'enrolled'), (1, 8, 'enrolled'), (1, 9, 'enrolled'), (1, 10, 'enrolled'),
    (1, 11, 'enrolled'), (1, 12, 'enrolled'), (1, 13, 'enrolled'), (1, 14, 'enrolled'), (1, 15, 'enrolled'),
    (1, 16, 'enrolled'), (1, 17, 'enrolled'), (1, 18, 'enrolled'), (1, 19, 'enrolled'), (1, 20, 'enrolled');

-- Seat assignments (one seat per student, single plan)
INSERT INTO seat_assignments (id, exam_id, seating_plan_id, student_id, seat_code, assigned_by) VALUES
    (1, 1, 1, 1, 'A1', 2), (2, 1, 1, 2, 'A2', 2), (3, 1, 1, 3, 'A3', 2), (4, 1, 1, 4, 'A4', 2), (5, 1, 1, 5, 'A5', 2),
    (6, 1, 1, 6, 'B1', 2), (7, 1, 1, 7, 'B2', 2), (8, 1, 1, 8, 'B3', 2), (9, 1, 1, 9, 'B4', 2), (10, 1, 1, 10, 'B5', 2),
    (11, 1, 1, 11, 'C1', 2), (12, 1, 1, 12, 'C2', 2), (13, 1, 1, 13, 'C3', 2), (14, 1, 1, 14, 'C4', 2), (15, 1, 1, 15, 'C5', 2),
    (16, 1, 1, 16, 'D1', 2), (17, 1, 1, 17, 'D2', 2), (18, 1, 1, 18, 'D3', 2), (19, 1, 1, 19, 'D4', 2), (20, 1, 1, 20, 'D5', 2);

-- Reference photos for face matching
INSERT INTO student_reference_photos (student_id, image_path, embedding_hash) VALUES
    (1, 'uploads/reference/student1.jpg', 'hash-student1'),
    (2, 'uploads/reference/student2.jpg', 'hash-student2'),
    (3, 'uploads/reference/student3.jpg', 'hash-student3'),
    (4, 'uploads/reference/student4.jpg', 'hash-student4'),
    (5, 'uploads/reference/student5.jpg', 'hash-student5');

-- Check-ins
INSERT INTO checkins (id, exam_id, student_id, seating_plan_id, seat_assignment_id, seat_code_entered, is_face_match, is_seat_ok, decision_status, checked_in_at, notes) VALUES
    (1, 1, 1, 1, 1, 'A1', 1, 1, 'approved', '2024-06-01 08:40:00', 'On time'),
    (2, 1, 2, 1, 2, 'A2', 1, 1, 'approved', '2024-06-01 08:42:00', 'On time'),
    (3, 1, 3, 1, 3, 'A3', 1, 0, 'pending', '2024-06-01 08:45:00', 'Seat check pending'),
    (4, 1, 4, 1, 4, 'A4', 0, 1, 'pending', '2024-06-01 08:46:00', 'Face mismatch, escalate'),
    (5, 1, 5, 1, 5, 'A5', 1, 1, 'approved', '2024-06-01 08:47:00', 'Approved'),
    (6, 1, 6, 1, 6, 'B1', 1, 0, 'denied', '2024-06-01 08:48:00', 'Wrong seat');

-- Violations
INSERT INTO violations (exam_id, student_id, checkin_id, reason, notes, evidence_image_path) VALUES
    (1, 4, 4, 'Face mismatch', 'Manual verification required', 'uploads/evidence/violation_face_4.jpg'),
    (1, 6, 6, 'Seating violation', 'Student sat in B2 instead of B1', 'uploads/evidence/violation_seat_6.jpg');
