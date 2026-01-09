# Software Requirements Specification (SRS)
## Exam Security System (Identity Verification + Seating Plan + Violation Logging)

**Document Version:** 1.0  
**Date:** January 2026  
**Project Name:** Exam Security System  
**Course:** Software Testing & Validation  

---

## Table of Contents

1. [Introduction](#introduction)
2. [Overall Description](#overall-description)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [System Architecture](#system-architecture)
6. [Database Requirements](#database-requirements)
7. [User Interface Requirements](#user-interface-requirements)
8. [Testing & Validation Requirements](#testing--validation-requirements)
9. [Glossary](#glossary)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the **Exam Security System**, a web-based application designed to manage exam-day security operations. The system ensures that only registered students enter the exam room, that they sit in assigned seats according to the seating plan, and that all violations are properly recorded and reported.

### 1.2 Scope

The Exam Security System is a web-based application that supports three core actors:
- **Students:** Individuals taking the exam
- **Proctors (Invigilators):** Personnel monitoring exam compliance
- **Exam Coordinators (Administrators):** Personnel managing exams, seating plans, and reports

The system integrates a simple machine learning/computer vision component for identity verification and provides comprehensive violation logging and reporting capabilities.

### 1.3 Document Conventions

- **Shall/Must:** Indicates a mandatory requirement
- **Should:** Indicates a recommended requirement
- **May:** Indicates an optional requirement
- **FR-X:** Functional Requirement identifier
- **NFR-X:** Non-Functional Requirement identifier

### 1.4 Intended Audience

- Development Team
- Quality Assurance Team
- Project Stakeholders
- Instructors and Evaluators

---

## 2. Overall Description

### 2.1 Product Perspective

The Exam Security System is a standalone web application that operates independently but may integrate with existing student information systems for roster import. It is designed to be deployed in a controlled exam environment with internet connectivity.

### 2.2 Product Functions

The system provides the following major functions:

1. **Authentication & Authorization:** Role-based access control for Proctors and Administrators
2. **Exam Management:** Create and configure exams with date, time, and room information
3. **Seating Plan Management:** Define and manage student seating assignments
4. **Student Roster Management:** Import or manually enter student information
5. **Identity Verification:** Capture and verify student identity using photo comparison
6. **Check-In Workflow:** Process student check-in with photo capture and verification
7. **Seat Compliance Verification:** Validate that students sit in assigned seats
8. **Violation Recording:** Log and document any exam violations
9. **Reporting:** Generate reports on check-ins, mismatches, and violations

### 2.3 User Classes and Characteristics

#### 2.3.1 Students
- **Characteristics:** Exam participants, may have limited technical experience
- **Responsibilities:** Provide identity verification, sit in assigned seat
- **Frequency of Use:** One-time per exam session

#### 2.3.2 Proctors (Invigilators)
- **Characteristics:** Trained exam monitors, moderate technical experience
- **Responsibilities:** Verify student identity, check seating compliance, record violations
- **Frequency of Use:** Throughout exam duration

#### 2.3.3 Exam Coordinators (Administrators)
- **Characteristics:** Exam management personnel, good technical experience
- **Responsibilities:** Create exams, manage seating plans, import rosters, generate reports
- **Frequency of Use:** Before and after exam sessions

### 2.4 Operating Environment

- **Platform:** Web-based application (browser-based)
- **Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Server:** Node.js/Express or Python/Flask backend
- **Database:** MySQL, PostgreSQL, or similar relational database
- **Hardware:** Standard desktop/laptop with camera for photo capture

### 2.5 Design and Implementation Constraints

- Simple ML/Computer Vision component (library-based, not custom-trained models)
- No deep learning model training required
- Grading focuses on integration, validation, and workflow correctness
- Role-based access control must be enforced
- System must handle concurrent user sessions

### 2.6 Assumptions and Dependencies

- Students have valid registered accounts with the system
- Photo capture devices (cameras) are available at check-in stations
- Network connectivity is stable during exam sessions
- Database is properly backed up and maintained
- ML/CV library (e.g., face_recognition, OpenCV) is available

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization (FR-1 to FR-3)

#### FR-1: User Login
- **Description:** Users shall authenticate using username and password
- **Actors:** Proctor, Administrator
- **Preconditions:** User account exists in the system
- **Steps:**
  1. User navigates to login page
  2. User enters username and password
  3. System validates credentials against database
  4. System creates session and redirects to dashboard
- **Postconditions:** User is authenticated and session is active
- **Alternative Flows:** Invalid credentials trigger error message; account lockout after 5 failed attempts

#### FR-2: Role-Based Access Control
- **Description:** System shall enforce role-based access control for Proctor and Administrator roles
- **Actors:** System
- **Rules:**
  - Proctors can only access check-in, violation recording, and basic reporting features
  - Administrators can access all features including exam creation, roster management, and advanced reporting
  - Students do not require login; they are identified during check-in
- **Validation:** Unauthorized access attempts shall be logged and rejected

#### FR-3: Session Management
- **Description:** System shall manage user sessions with automatic timeout
- **Timeout Duration:** 30 minutes of inactivity
- **Actions:** Expired sessions redirect users to login page
- **Validation:** Session tokens are validated on each request

### 3.2 Exam Management (FR-4 to FR-6)

#### FR-4: Exam Creation
- **Description:** Administrators shall create exams with the following information:
  - Exam name/code
  - Date and time
  - Room/location
  - Duration
  - Maximum capacity
- **Validation Rules:**
  - Exam code must be unique
  - Date/time must be in the future
  - Capacity must be greater than 0
- **Postconditions:** Exam is created and available for roster and seating plan assignment

#### FR-5: Exam Configuration
- **Description:** Administrators shall configure exam parameters:
  - Enable/disable identity verification requirement
  - Set seating plan requirement (mandatory/optional)
  - Configure violation categories and severity levels
- **Validation:** Configuration changes are logged with timestamp and user ID

#### FR-6: Exam Status Management
- **Description:** System shall track exam status:
  - Draft: Exam created but not yet active
  - Active: Exam is ongoing
  - Completed: Exam has ended
  - Archived: Exam is closed and reports are final
- **Transitions:** Only authorized transitions are allowed (Draft → Active → Completed → Archived)

### 3.3 Student Roster Management (FR-7 to FR-9)

#### FR-7: Student Roster Import
- **Description:** Administrators shall import student roster via CSV file upload
- **File Format:** CSV with columns: StudentID, FirstName, LastName, Email, RegistrationNumber
- **Validation Rules:**
  - StudentID must be unique
  - Required fields must not be empty
  - Duplicate entries are flagged for review
- **Postconditions:** Students are added to the exam roster

#### FR-8: Manual Student Entry
- **Description:** Administrators shall manually add individual students to the roster
- **Fields Required:** StudentID, FirstName, LastName, Email, RegistrationNumber
- **Validation:** Same rules as FR-7
- **Postconditions:** Student is added to roster

#### FR-9: Roster Management
- **Description:** Administrators shall manage the student roster:
  - View all students in roster
  - Edit student information
  - Remove students from roster
  - Export roster to CSV
- **Validation:** Changes are logged with timestamp and user ID

### 3.4 Seating Plan Management (FR-10 to FR-12)

#### FR-10: Seating Plan Creation
- **Description:** Administrators shall create seating plans with the following options:
  - **Grid-Based:** Define rows and columns (e.g., 10 rows × 8 columns)
  - **Seat Code-Based:** Define individual seat codes (e.g., A1, A2, B1, etc.)
- **Validation Rules:**
  - Total seats must be ≥ number of students in roster
  - Seat identifiers must be unique
  - Plan must be associated with an exam
- **Postconditions:** Seating plan is created and ready for student assignment

#### FR-11: Student Seat Assignment
- **Description:** Administrators shall assign students to seats:
  - Manual assignment: Drag-and-drop or form-based
  - Automatic assignment: Random or sequential
- **Validation Rules:**
  - Each student assigned to exactly one seat
  - Each seat assigned to at most one student
  - Cannot assign students not in roster
- **Postconditions:** All students have assigned seats

#### FR-12: Seating Plan Visualization
- **Description:** System shall display seating plan with:
  - Visual grid or layout representation
  - Student names/IDs in assigned seats
  - Color coding for assigned/unassigned/occupied seats
  - Real-time updates during check-in
- **Actors:** Proctor, Administrator
- **Validation:** Display updates within 5 seconds of check-in

### 3.5 Identity Verification (FR-13 to FR-15)

#### FR-13: Photo Capture
- **Description:** System shall capture student photo during check-in
- **Process:**
  1. Student positions face in front of camera
  2. System captures image automatically or on manual trigger
  3. Image is stored with timestamp and student ID
- **Technical Requirements:**
  - Support multiple image formats (JPEG, PNG)
  - Image resolution ≥ 640×480 pixels
  - Automatic face detection to guide student positioning
- **Validation:** Image must contain a detectable face

#### FR-14: ML/Computer Vision Verification
- **Description:** System shall verify captured photo against registered student photo using ML/CV
- **Implementation Options:**
  - Face verification using face_recognition library (embedding-based comparison)
  - ID photo similarity comparison using OpenCV
  - Basic template matching with embeddings
- **Process:**
  1. Extract face embeddings from captured photo
  2. Compare with registered student photo embeddings
  3. Generate match confidence score (0-100%)
  4. Determine pass/fail based on threshold (e.g., 70%)
- **Output:** Match result (Match/No Match) with confidence score
- **Validation:**
  - Threshold must be configurable
  - Results must be logged with timestamp
  - Manual override available for Proctors

#### FR-15: Verification Decision
- **Description:** System shall present verification decision to Proctor
- **Display Information:**
  - Captured photo
  - Registered student photo
  - Match confidence score
  - Recommendation (Match/No Match)
- **Proctor Actions:**
  - Accept verification (proceed to seating check)
  - Reject verification (student not allowed to sit)
  - Override decision (manual approval despite mismatch)
- **Postconditions:** Verification result is recorded with timestamp and Proctor ID

### 3.6 Check-In Workflow (FR-16 to FR-20)

#### FR-16: Check-In Initiation
- **Description:** Proctor initiates check-in process for a student
- **Input:** Student ID or name search
- **Process:**
  1. System retrieves student information from roster
  2. System displays student details and assigned seat
  3. System prompts for photo capture
- **Validation:** Student must be in roster and not already checked in

#### FR-17: Photo Capture & Upload
- **Description:** System captures and uploads student photo during check-in
- **Process:**
  1. Camera interface is displayed
  2. Student positions face in frame
  3. Photo is captured (automatic or manual trigger)
  4. Photo is uploaded to server
  5. System confirms successful upload
- **Validation:** Photo must be valid and contain detectable face

#### FR-18: ML Verification Decision
- **Description:** System processes photo through ML/CV component
- **Process:**
  1. System extracts face embeddings from captured photo
  2. System compares with registered student photo
  3. System generates confidence score
  4. System presents result to Proctor
- **Output:** Match/No Match with confidence score
- **Validation:** Result is logged with timestamp

#### FR-19: Seat Compliance Check
- **Description:** System verifies that student is sitting in assigned seat
- **Process:**
  1. Proctor confirms student identity (after verification)
  2. Proctor verifies student is in correct seat (visual confirmation)
  3. System records seat assignment and check-in time
- **Validation:** Seat must match student's assigned seat
- **Alternative:** If student is in wrong seat, violation is recorded (see FR-24)

#### FR-20: Check-In Completion
- **Description:** System completes check-in process and records result
- **Recorded Information:**
  - Student ID
  - Check-in timestamp
  - Verification result (Match/No Match)
  - Assigned seat
  - Actual seat (if different)
  - Proctor ID
  - Any violations or notes
- **Postconditions:** Student is marked as checked-in; seating plan is updated

### 3.7 Violation Recording (FR-21 to FR-24)

#### FR-21: Violation Categories
- **Description:** System shall support the following violation categories:
  - Identity Mismatch: Captured photo does not match registered photo
  - Seat Mismatch: Student sitting in wrong seat
  - Unauthorized Materials: Student has prohibited materials
  - Disruptive Behavior: Student is disruptive
  - Late Arrival: Student arrives after exam start
  - Other: Custom violation reason
- **Validation:** Each violation must have a category

#### FR-22: Violation Recording
- **Description:** Proctor shall record violations with the following information:
  - Violation category
  - Student ID
  - Timestamp
  - Reason/notes (text description)
  - Evidence image (optional)
  - Severity level (Low/Medium/High)
- **Validation Rules:**
  - All required fields must be completed
  - Timestamp must be during exam session
  - Evidence image (if provided) must be valid image file
- **Postconditions:** Violation is recorded and associated with student

#### FR-23: Violation Evidence
- **Description:** Proctor may attach evidence image to violation record
- **Process:**
  1. Proctor captures or uploads image as evidence
  2. System stores image with violation record
  3. Image is linked to violation ID
- **Validation:** Image must be valid format (JPEG, PNG)
- **Optional:** Evidence images are optional but recommended

#### FR-24: Violation Status Tracking
- **Description:** System shall track violation status:
  - Recorded: Violation is logged
  - Reviewed: Violation has been reviewed by administrator
  - Resolved: Violation has been addressed
  - Dismissed: Violation is not substantiated
- **Transitions:** Only authorized transitions allowed
- **Validation:** Status changes are logged with timestamp and user ID

### 3.8 Reporting (FR-25 to FR-28)

#### FR-25: Check-In Report
- **Description:** System shall generate check-in report with:
  - List of all students checked in
  - Check-in timestamp
  - Verification result (Match/No Match)
  - Assigned vs. actual seat
  - Proctor who performed check-in
- **Format:** Exportable to CSV, PDF, or display in web interface
- **Filters:** By exam, by date range, by proctor

#### FR-26: Mismatch Report
- **Description:** System shall generate mismatch report with:
  - Students with identity mismatches
  - Students in wrong seats
  - Timestamp of mismatch detection
  - Proctor who recorded mismatch
  - Action taken (override, rejection, etc.)
- **Format:** Exportable to CSV, PDF, or display in web interface
- **Filters:** By exam, by type of mismatch, by severity

#### FR-27: Violation Report
- **Description:** System shall generate violation report with:
  - All recorded violations
  - Violation category and severity
  - Student involved
  - Timestamp and proctor
  - Reason/notes and evidence
  - Current status
- **Format:** Exportable to CSV, PDF, or display in web interface
- **Filters:** By exam, by category, by severity, by student, by status

#### FR-28: Summary Report
- **Description:** System shall generate summary report with:
  - Total students in roster
  - Total students checked in
  - Total no-shows
  - Total violations by category
  - Compliance percentage
  - Exam duration and completion time
- **Format:** Exportable to PDF or display in web interface
- **Audience:** Administrators and exam coordinators

### 3.9 Data Management (FR-29 to FR-31)

#### FR-29: Data Persistence
- **Description:** System shall persist all data to database:
  - User accounts and authentication tokens
  - Exam configurations
  - Student rosters
  - Seating plans
  - Check-in records
  - Violation records
  - Photo images
- **Validation:** Data is backed up regularly

#### FR-30: Photo Storage
- **Description:** System shall store student photos securely:
  - Registered student photos (for identity verification)
  - Captured check-in photos
  - Evidence images for violations
- **Storage:** File system or cloud storage with secure access controls
- **Retention:** Photos retained for exam archive period

#### FR-31: Data Export
- **Description:** Administrators shall export data:
  - Rosters to CSV
  - Seating plans to CSV
  - Reports to CSV/PDF
  - Exam data for archival
- **Validation:** Exported data includes all relevant fields and metadata

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-1 to NFR-3)

#### NFR-1: Response Time
- **Check-In Process:** Photo capture to verification result ≤ 5 seconds
- **Report Generation:** Reports generated within 10 seconds
- **Page Load Time:** Web pages load within 2 seconds
- **Database Queries:** Queries execute within 1 second

#### NFR-2: Concurrent Users
- **System shall support:** Minimum 50 concurrent users
- **Scalability:** System architecture allows for horizontal scaling

#### NFR-3: Throughput
- **Check-In Throughput:** System shall process ≥ 10 check-ins per minute
- **Report Generation:** System shall generate reports for ≥ 500 students within 30 seconds

### 4.2 Reliability (NFR-4 to NFR-6)

#### NFR-4: Availability
- **Uptime:** System shall maintain ≥ 99% availability during exam hours
- **Backup:** Automated daily backups of database and photos
- **Recovery:** System recovery time objective (RTO) ≤ 1 hour

#### NFR-5: Data Integrity
- **Transactions:** Database transactions ensure ACID properties
- **Constraints:** Database constraints enforce business rules
- **Validation:** Input validation prevents data corruption

#### NFR-6: Error Handling
- **Graceful Degradation:** System continues operation with reduced functionality on component failure
- **Error Logging:** All errors logged with timestamp, user ID, and context
- **User Notification:** Users notified of errors with clear messages

### 4.3 Security (NFR-7 to NFR-10)

#### NFR-7: Authentication Security
- **Password Requirements:** Minimum 8 characters, complexity rules enforced
- **Password Hashing:** Passwords hashed using bcrypt or similar algorithm
- **Session Security:** Session tokens are cryptographically secure and time-limited

#### NFR-8: Authorization Security
- **Access Control:** Role-based access control enforced at all levels
- **Audit Trail:** All access attempts logged with user ID, timestamp, and action
- **Principle of Least Privilege:** Users have minimum necessary permissions

#### NFR-9: Data Security
- **Encryption in Transit:** HTTPS/TLS for all communications
- **Encryption at Rest:** Sensitive data encrypted in database (optional)
- **Photo Security:** Photos stored with restricted access controls
- **PII Protection:** Personal information (names, IDs, emails) protected

#### NFR-10: Audit & Logging
- **Event Logging:** All significant events logged (login, check-in, violations, reports)
- **Log Retention:** Logs retained for minimum 1 year
- **Log Security:** Logs protected from unauthorized modification

### 4.4 Usability (NFR-11 to NFR-13)

#### NFR-11: User Interface
- **Intuitive Design:** UI is intuitive and requires minimal training
- **Accessibility:** System supports standard accessibility features (keyboard navigation, screen readers)
- **Responsive Design:** UI adapts to different screen sizes

#### NFR-12: Documentation
- **User Manual:** Comprehensive user manual for Proctors and Administrators
- **Help System:** In-app help and tooltips for key features
- **Training Materials:** Training materials for system users

#### NFR-13: Localization
- **Language Support:** System supports English (minimum)
- **Date/Time Format:** Configurable date and time formats

### 4.5 Maintainability (NFR-14 to NFR-16)

#### NFR-14: Code Quality
- **Code Standards:** Code follows established style guidelines
- **Code Documentation:** Code includes comments and documentation
- **Modularity:** Code is modular and loosely coupled

#### NFR-15: Testability
- **Unit Testing:** Critical business logic has unit test coverage ≥ 80%
- **Integration Testing:** Integration tests cover major workflows
- **Test Documentation:** Test cases documented with clear preconditions and expected results

#### NFR-16: Deployability
- **Deployment Automation:** Deployment process is automated
- **Configuration Management:** Configuration is externalized and environment-specific
- **Version Control:** All code and documentation in version control

---

## 5. System Architecture

### 5.1 High-Level Architecture

The Exam Security System follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (Web UI - HTML/CSS/JavaScript)                 │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│         (Backend API - Node.js/Express or Python/Flask)     │
│                                                              │
│  ├─ Authentication & Authorization Service                 │
│  ├─ Exam Management Service                                │
│  ├─ Roster Management Service                              │
│  ├─ Seating Plan Service                                   │
│  ├─ Check-In Service                                       │
│  ├─ ML/CV Integration Service                              │
│  ├─ Violation Recording Service                            │
│  ├─ Reporting Service                                      │
│  └─ File Management Service                                │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│              (Database & File Storage)                       │
│                                                              │
│  ├─ Relational Database (MySQL/PostgreSQL)                 │
│  ├─ File Storage (Local Filesystem or Cloud)               │
│  └─ Cache Layer (Redis - optional)                         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (React/Vue.js optional)
- **Backend:** Node.js with Express.js OR Python with Flask
- **Database:** MySQL 8.0+ or PostgreSQL 12+
- **File Storage:** Local filesystem or AWS S3/Azure Blob Storage
- **ML/CV Library:** face_recognition, OpenCV, or scikit-image
- **Authentication:** JWT tokens or session-based authentication
- **API:** RESTful API with JSON payloads

### 5.3 Component Descriptions

#### 5.3.1 Authentication Service
- Manages user login and session management
- Enforces role-based access control
- Handles password hashing and validation
- Manages session tokens and timeouts

#### 5.3.2 Exam Management Service
- CRUD operations for exams
- Exam status transitions
- Exam configuration management

#### 5.3.3 Roster Management Service
- CSV import functionality
- Manual student entry
- Roster CRUD operations
- Roster validation and deduplication

#### 5.3.4 Seating Plan Service
- Seating plan creation and management
- Student-to-seat assignment
- Seating plan visualization
- Seat availability tracking

#### 5.3.5 Check-In Service
- Check-in workflow orchestration
- Student lookup and verification
- Integration with ML/CV service
- Check-in record creation

#### 5.3.6 ML/CV Integration Service
- Face detection and embedding extraction
- Photo comparison and similarity scoring
- Verification decision logic
- Confidence score calculation

#### 5.3.7 Violation Recording Service
- Violation CRUD operations
- Evidence image attachment
- Violation status tracking
- Violation validation

#### 5.3.8 Reporting Service
- Report generation (check-in, mismatch, violation, summary)
- Report filtering and sorting
- Export functionality (CSV, PDF)
- Report caching for performance

#### 5.3.9 File Management Service
- Photo upload and storage
- Photo retrieval
- File validation and security
- File cleanup and archival

---

## 6. Database Requirements

### 6.1 Database Schema

#### 6.1.1 Users Table
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('PROCTOR', 'ADMIN') NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### 6.1.2 Exams Table
```sql
CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_code VARCHAR(50) UNIQUE NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    room_location VARCHAR(255),
    duration_minutes INT,
    max_capacity INT,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

#### 6.1.3 Students Table
```sql
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    registration_number VARCHAR(50),
    registered_photo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 6.1.4 Exam Rosters Table
```sql
CREATE TABLE exam_rosters (
    roster_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    assigned_seat VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE KEY unique_exam_student (exam_id, student_id)
);
```

#### 6.1.5 Seating Plans Table
```sql
CREATE TABLE seating_plans (
    seating_plan_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    plan_name VARCHAR(255),
    plan_type ENUM('GRID', 'SEAT_CODES') NOT NULL,
    rows INT,
    columns INT,
    total_seats INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

#### 6.1.6 Seats Table
```sql
CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    seating_plan_id INT NOT NULL,
    seat_code VARCHAR(50) NOT NULL,
    row_number INT,
    column_number INT,
    is_occupied BOOLEAN DEFAULT FALSE,
    occupied_by_student_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seating_plan_id) REFERENCES seating_plans(seating_plan_id),
    FOREIGN KEY (occupied_by_student_id) REFERENCES students(student_id),
    UNIQUE KEY unique_seat_code (seating_plan_id, seat_code)
);
```

#### 6.1.7 Check-Ins Table
```sql
CREATE TABLE check_ins (
    check_in_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    check_in_timestamp TIMESTAMP NOT NULL,
    captured_photo_path VARCHAR(255),
    verification_result ENUM('MATCH', 'NO_MATCH', 'OVERRIDE') NOT NULL,
    confidence_score DECIMAL(5, 2),
    assigned_seat VARCHAR(50),
    actual_seat VARCHAR(50),
    proctor_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (proctor_id) REFERENCES users(user_id)
);
```

#### 6.1.8 Violations Table
```sql
CREATE TABLE violations (
    violation_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    violation_category ENUM('IDENTITY_MISMATCH', 'SEAT_MISMATCH', 'UNAUTHORIZED_MATERIALS', 
                           'DISRUPTIVE_BEHAVIOR', 'LATE_ARRIVAL', 'OTHER') NOT NULL,
    violation_timestamp TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    evidence_image_path VARCHAR(255),
    status ENUM('RECORDED', 'REVIEWED', 'RESOLVED', 'DISMISSED') DEFAULT 'RECORDED',
    proctor_id INT NOT NULL,
    reviewed_by INT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (proctor_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);
```

#### 6.1.9 Audit Logs Table
```sql
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 6.2 Database Constraints

- **Primary Keys:** All tables have primary keys
- **Foreign Keys:** Referential integrity enforced
- **Unique Constraints:** Prevent duplicate entries (exam_code, student_number, username, email)
- **Not Null Constraints:** Required fields cannot be null
- **Check Constraints:** Enum fields restricted to valid values
- **Default Values:** Timestamps default to current time

### 6.3 Indexes

- Index on `exams.exam_code` for fast lookup
- Index on `students.student_number` for fast lookup
- Index on `check_ins.exam_id, student_id` for fast retrieval
- Index on `violations.exam_id, student_id` for fast retrieval
- Index on `audit_logs.user_id, timestamp` for audit trail queries

### 6.4 Dummy Data Requirements

- At least 5 test exams with various statuses
- At least 50 test students with diverse names
- At least 3 seating plans with different configurations
- Sample check-in records with various verification results
- Sample violations across all categories and severity levels
- Sample audit logs demonstrating system activity

---

## 7. User Interface Requirements

### 7.1 Login Page
- Username and password input fields
- Login button
- Error message display for invalid credentials
- Password reset link (optional)
- Role indication after login

### 7.2 Administrator Dashboard
- Exam management section (create, edit, view exams)
- Roster management section (import, view, edit rosters)
- Seating plan management section
- Reporting section
- User management section (optional)

### 7.3 Proctor Dashboard
- Check-in interface with student search
- Photo capture interface
- Verification result display
- Seating plan visualization
- Violation recording form
- Quick access to reports

### 7.4 Check-In Interface
- Student information display
- Camera/photo upload interface
- Verification result display with confidence score
- Assigned seat display
- Violation recording option
- Check-in confirmation

### 7.5 Seating Plan Visualization
- Grid or layout representation of seats
- Color coding (assigned, unassigned, occupied)
- Student names/IDs in seats
- Real-time updates during check-in
- Zoom and pan functionality

### 7.6 Reporting Interface
- Report type selection (check-in, mismatch, violation, summary)
- Filter options (exam, date range, proctor, student, etc.)
- Report display with sorting and pagination
- Export buttons (CSV, PDF)
- Print functionality

---

## 8. Testing & Validation Requirements

### 8.1 Test Case Categories

#### 8.1.1 Functional Test Cases
- **Authentication:** Valid/invalid credentials, role-based access, session timeout
- **Exam Management:** Create, edit, delete, status transitions
- **Roster Management:** Import, manual entry, edit, delete, export
- **Seating Plan:** Create, assign seats, visualize, update
- **Check-In:** Student lookup, photo capture, verification, seat check
- **Violation Recording:** Record, update status, attach evidence
- **Reporting:** Generate reports, filter, export

#### 8.1.2 Negative Test Cases
- **Missing Data:** Missing required fields, incomplete forms
- **Invalid Data:** Invalid email, invalid date, invalid seat assignment
- **Duplicate Data:** Duplicate student IDs, duplicate exam codes
- **Boundary Cases:** Maximum capacity exceeded, invalid date ranges
- **Unauthorized Access:** Access without login, role-based access violations

#### 8.1.3 Edge Cases
- **Concurrent Operations:** Multiple simultaneous check-ins, concurrent edits
- **Large Data Sets:** Import large rosters, generate reports for many students
- **Missing Images:** Check-in without photo, missing registered photo
- **Network Issues:** Upload interruption, timeout during verification
- **Multiple Faces:** Photo with multiple faces, unclear faces

### 8.2 Unit Testing Requirements

#### 8.2.1 Test Scope
- Authentication logic (password hashing, token validation)
- Seating compliance logic (seat assignment validation)
- Violation validation rules
- Report generation logic
- ML/CV wrapper service (mocked ML calls)

#### 8.2.2 Test Framework
- Node.js: Jest or Mocha
- Python: pytest or unittest
- Minimum coverage: 80% for critical business logic

#### 8.2.3 Mock Requirements
- Mock ML/CV library responses
- Mock file system operations
- Mock database queries (optional)

### 8.3 Test Documentation

#### 8.3.1 Test Case Document Format
```
Test ID: TC-001
Title: Valid Login with Correct Credentials
Precondition: User account exists with username 'admin' and password 'Test123!'
Steps:
  1. Navigate to login page
  2. Enter username 'admin'
  3. Enter password 'Test123!'
  4. Click Login button
Expected Result: User is authenticated and redirected to dashboard
Actual Result: [To be filled during testing]
Status: [PASS/FAIL]
Notes: [Any observations]
```

#### 8.3.2 Test Case Categories
- Minimum 50 functional test cases
- Minimum 20 negative test cases
- Minimum 10 edge case test cases
- Minimum 15 unit tests for critical logic

### 8.4 Validation Criteria

- All test cases executed and documented
- Unit tests pass with ≥80% coverage
- No critical defects in production
- All functional requirements validated
- Performance requirements met
- Security requirements validated

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| **Exam Coordinator** | Administrator responsible for creating exams and managing configurations |
| **Proctor** | Invigilator responsible for monitoring exam and recording violations |
| **Student** | Individual taking the exam |
| **Roster** | List of students registered for an exam |
| **Seating Plan** | Assignment of students to specific seats |
| **Check-In** | Process of verifying student identity and recording attendance |
| **Verification** | Confirmation that captured photo matches registered student photo |
| **Violation** | Breach of exam rules recorded by proctor |
| **Confidence Score** | Numerical measure (0-100%) of photo similarity |
| **ACID** | Atomicity, Consistency, Isolation, Durability (database transaction properties) |
| **JWT** | JSON Web Token (authentication mechanism) |
| **ML/CV** | Machine Learning / Computer Vision |
| **Face Embedding** | Numerical vector representation of facial features |
| **Threshold** | Minimum confidence score required for verification match |
| **Audit Trail** | Log of all system activities for accountability |
| **RTO** | Recovery Time Objective (maximum acceptable downtime) |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Project Team | Initial SRS document creation |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | [Name] | [Signature] | [Date] |
| Technical Lead | [Name] | [Signature] | [Date] |
| Quality Assurance Lead | [Name] | [Signature] | [Date] |

---

**End of Document**


## 7. Business Rules

This section outlines the key business rules that govern the behavior of the Exam Security System. These rules ensure data integrity, security, and consistent operational workflows.

### 7.1. BR-1: Exam Status Progression

- **Description**: An exam must follow a specific lifecycle: DRAFT → ACTIVE → COMPLETED → ARCHIVED.
- **Rationale**: Ensures that exams are properly configured before becoming active and are properly closed after completion.
- **Validation**: The system will only allow status transitions in the specified order. For example, an exam cannot be moved from DRAFT to COMPLETED.
- **Error Handling**: An error message will be displayed if an invalid status transition is attempted.
- **Related Requirements**: FR-4, FR-5

### 7.2. BR-2: Proctor-Exam Assignment

- **Description**: A proctor must be assigned to an exam to perform check-ins and record violations for that exam.
- **Rationale**: Enforces accountability and ensures that only authorized proctors can manage a specific exam session.
- **Validation**: The system will check for a valid proctor-exam assignment before allowing any operational actions.
- **Error Handling**: Access will be denied with a "Not authorized for this exam" message if a proctor attempts to access an unassigned exam.
- **Related Requirements**: FR-2, FR-15

### 7.3. BR-3: Identity Verification Threshold

- **Description**: A confidence score of 75% or higher from the ML/CV service is required for an automatic identity match.
- **Rationale**: Balances security with usability by setting a reasonable threshold for automated verification, reducing false positives while still flagging significant mismatches.
- **Validation**: The system will check if `confidence_score >= 0.75` to determine the verification result.
- **Error Handling**: Scores below 75% will be flagged as a "NO_MATCH", requiring manual review and override by the proctor.
- **Related Requirements**: FR-14, FR-19

### 7.4. BR-4: Account Lockout Policy

- **Description**: A user account will be temporarily locked after 5 consecutive failed login attempts.
- **Rationale**: Prevents brute-force attacks on user accounts.
- **Validation**: The system will track the number of failed login attempts for each user.
- **Error Handling**: After 5 failed attempts, the user account will be deactivated (`is_active = false`) and an administrator will need to reactivate it.
- **Related Requirements**: FR-1

### 7.5. BR-5: Violation-Check-In Association

- **Description**: All recorded violations must be linked to a valid check-in record.
- **Rationale**: Ensures traceability and context for every violation, linking it to a specific student and exam session.
- **Validation**: A foreign key constraint (`check_in_id`) will enforce this relationship at the database level.
- **Error Handling**: The system will prevent the creation of a violation if it is not associated with a valid check-in.
- **Related Requirements**: FR-21

### 7.6. BR-6: Seat Assignment Timing

- **Description**: Seat assignments for an exam can only be created or modified before the exam start time.
- **Rationale**: Prevents changes to the seating plan while an exam is in progress, ensuring stability and fairness.
- **Validation**: The system will check if `current_time < exam.start_time` before allowing any modifications to the seating plan.
- **Error Handling**: An error message will be displayed if a user attempts to modify the seating plan for an active or completed exam.
- **Related Requirements**: FR-11

### 7.7. BR-7: Photo Requirement for Verification

- **Description**: A registered student photo is mandatory for the ML/CV identity verification process to run.
- **Rationale**: The system cannot perform a comparison without a reference photo, which is the basis of the identity verification feature.
- **Validation**: The system will check if the `registered_photo_path` is not NULL or empty for a student before initiating the check-in process.
- **Error Handling**: If a student does not have a registered photo, the system will display a message indicating that automated verification is not possible and will require manual proctor approval.
- **Related Requirements**: FR-13, FR-16

### 7.8. BR-8: Role-Based Report Access

- **Description**: Proctors can only view reports for exams they are assigned to, while Administrators can view reports for all exams.
- **Rationale**: Enforces data privacy and the principle of least privilege, ensuring users can only access data relevant to their duties.
- **Validation**: The system will filter report data based on the user's role and their exam assignments.
- **Error Handling**: An HTTP 403 Forbidden error will be returned if a user attempts to access a report for which they are not authorized.
- **Related Requirements**: FR-2, FR-25
