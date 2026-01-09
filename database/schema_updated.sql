-- Exam Security System - Database Schema
-- Version: 2.0 (Updated according to requirements)
-- Date: January 2026

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS check_ins;
DROP TABLE IF EXISTS seat_assignments;
DROP TABLE IF EXISTS seating_plans;
DROP TABLE IF EXISTS exam_rosters;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('PROCTOR', 'ADMIN') NOT NULL,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms Table (NEW)
CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_code VARCHAR(50) UNIQUE NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    building VARCHAR(100),
    floor INT,
    capacity INT NOT NULL,
    has_camera BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_code (room_code),
    INDEX idx_building (building)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exams Table (UPDATED with room_id FK)
CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_code VARCHAR(50) UNIQUE NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    room_id INT,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_exam_code (exam_code),
    INDEX idx_exam_date (exam_date),
    INDEX idx_status (status),
    INDEX idx_room_id (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students Table (UPDATED with additional fields)
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    registered_photo_path VARCHAR(255),
    enrollment_year INT,
    major VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_number (student_number),
    INDEX idx_email (email),
    INDEX idx_enrollment_year (enrollment_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Rosters Table (kept for backward compatibility)
CREATE TABLE exam_rosters (
    roster_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    assigned_seat VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_exam_student (exam_id, student_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seating Plans Table (UPDATED with room_id FK)
CREATE TABLE seating_plans (
    seating_plan_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    room_id INT,
    total_rows INT,
    total_columns INT,
    layout_type ENUM('GRID', 'CUSTOM') DEFAULT 'GRID',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_room_id (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seat Assignments Table (RENAMED from seats, UPDATED structure)
CREATE TABLE seat_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    seating_plan_id INT NOT NULL,
    student_id INT NOT NULL,
    seat_code VARCHAR(50) NOT NULL,
    row_number INT,
    column_number INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seating_plan_id) REFERENCES seating_plans(seating_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan_student (seating_plan_id, student_id),
    UNIQUE KEY unique_plan_seat (seating_plan_id, seat_code),
    INDEX idx_seating_plan_id (seating_plan_id),
    INDEX idx_student_id (student_id),
    INDEX idx_seat_code (seat_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check-Ins Table (UPDATED with additional fields)
CREATE TABLE check_ins (
    check_in_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    proctor_id INT NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    captured_photo_path VARCHAR(255),
    verification_result ENUM('MATCH', 'NO_MATCH', 'OVERRIDE', 'PENDING') NOT NULL,
    confidence_score DECIMAL(5,2),
    assigned_seat VARCHAR(50),
    actual_seat VARCHAR(50),
    seat_match BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (proctor_id) REFERENCES users(user_id),
    UNIQUE KEY unique_exam_student_checkin (exam_id, student_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id),
    INDEX idx_proctor_id (proctor_id),
    INDEX idx_verification_result (verification_result),
    INDEX idx_check_in_time (check_in_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Violations Table (UPDATED with check_in_id FK and additional fields)
CREATE TABLE violations (
    violation_id INT PRIMARY KEY AUTO_INCREMENT,
    check_in_id INT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    reported_by INT NOT NULL,
    violation_type ENUM('IDENTITY_MISMATCH', 'SEAT_MISMATCH', 'UNAUTHORIZED_MATERIALS', 
                        'DISRUPTIVE_BEHAVIOR', 'LATE_ARRIVAL', 'OTHER') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    description TEXT,
    evidence_photo_path VARCHAR(255),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('RECORDED', 'REVIEWED', 'RESOLVED', 'DISMISSED') DEFAULT 'RECORDED',
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    resolved_by INT,
    FOREIGN KEY (check_in_id) REFERENCES check_ins(check_in_id) ON DELETE SET NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_check_in_id (check_in_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id),
    INDEX idx_reported_by (reported_by),
    INDEX idx_violation_type (violation_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_reported_at (reported_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table (UPDATED with additional fields)
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_table_name (table_name),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Test123!)
INSERT INTO users (username, password_hash, email, role, full_name, is_active) VALUES
('admin1', '$2b$10$YourHashedPasswordHere', 'admin@examSecurity.com', 'ADMIN', 'System Administrator', TRUE);

-- Insert sample rooms
INSERT INTO rooms (room_code, room_name, building, floor, capacity, has_camera) VALUES
('A-101', 'Lecture Hall A-101', 'Main Building', 1, 100, TRUE),
('B-201', 'Computer Lab B-201', 'Science Building', 2, 50, TRUE),
('C-301', 'Auditorium C-301', 'Arts Building', 3, 200, TRUE);
