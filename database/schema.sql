-- Schema for Exam Security System (MariaDB)
CREATE DATABASE IF NOT EXISTS exam_security CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exam_security;

SET NAMES utf8mb4;

-- Drop existing tables (order matters for FKs)
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS student_reference_photos;
DROP TABLE IF EXISTS seat_assignments;
DROP TABLE IF EXISTS exam_students;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS seating_plans;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    location VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    room_id INT,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE seating_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    room_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_seating_plan_exam_name (exam_id, name),
    KEY idx_seating_plan_id_exam (id, exam_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seating_plan_id INT NOT NULL,
    seat_code VARCHAR(50) NOT NULL,
    `row_number` INT NOT NULL,
    col_number INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_seat_code_per_plan (seating_plan_id, seat_code),
    UNIQUE KEY uq_seat_position_per_plan (seating_plan_id, `row_number`, col_number),
    FOREIGN KEY (seating_plan_id) REFERENCES seating_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exam_students (
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('enrolled', 'dropped') NOT NULL DEFAULT 'enrolled',
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE seat_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    seating_plan_id INT NOT NULL,
    student_id INT NOT NULL,
    seat_code VARCHAR(50) NOT NULL,
    assigned_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_assignment_exam_student (exam_id, student_id),
    UNIQUE KEY uq_assignment_exam_seat (exam_id, seat_code),
    FOREIGN KEY (exam_id, student_id) REFERENCES exam_students(exam_id, student_id) ON DELETE CASCADE,
    FOREIGN KEY (seating_plan_id, exam_id) REFERENCES seating_plans(id, exam_id) ON DELETE CASCADE,
    FOREIGN KEY (seating_plan_id, seat_code) REFERENCES seats(seating_plan_id, seat_code) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE student_reference_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    embedding_hash VARCHAR(255),
    meta_data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_image_path (student_id, image_path),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    seating_plan_id INT,
    seat_assignment_id INT,
    seat_code_entered VARCHAR(50),
    is_face_match TINYINT(1) NOT NULL DEFAULT 0,
    is_seat_ok TINYINT(1) NOT NULL DEFAULT 0,
    decision_status ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
    photo_path VARCHAR(255),
    checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE KEY uq_checkins_exam_student (exam_id, student_id),
    FOREIGN KEY (exam_id, student_id) REFERENCES exam_students(exam_id, student_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_assignment_id) REFERENCES seat_assignments(id) ON DELETE SET NULL,
    FOREIGN KEY (seating_plan_id) REFERENCES seating_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE violations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    checkin_id INT,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    evidence_image_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id, student_id) REFERENCES exam_students(exam_id, student_id) ON DELETE CASCADE,
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
