# System Diagrams

This directory contains all system diagrams for the Exam Security System project.

## Diagrams Overview

### 1. Use Case Diagram (`usecase.mmd` / `usecase.png`)

The Use Case diagram illustrates the interactions between different actors (Administrator, Proctor, Student, ML/CV Service) and the system's functionalities.

**Key Use Cases:**
- **Authentication**: Login, Logout, Session Management
- **Exam Management**: Create, Update, Delete, Change Status, View Exams
- **Roster Management**: Import, Add, Edit, Remove, Export Students
- **Seating Plan Management**: Create, Assign, View, Update Seating Plans
- **Check-In Workflow**: Search, Capture Photo, Verify Identity, Check Seat, Complete Check-In
- **Violation Management**: Record, Attach Evidence, Update Status, View, Delete Violations
- **Reporting**: Generate Check-In, Mismatch, Violation, and Summary Reports

**Actors:**
- **Administrator**: Full system access, manages exams, rosters, and seating plans
- **Proctor**: Performs check-ins, records violations, views reports
- **Student**: Participates in check-in process (passive role)
- **ML/CV Service**: Automated photo verification service

---

### 2. Entity Relationship Diagram (`erd.mmd` / `erd.png`)

The ERD shows the database schema with all tables, their attributes, data types, and relationships.

**Main Entities:**
- **USERS**: System users (Admins and Proctors)
- **EXAMS**: Exam configurations and details
- **STUDENTS**: Student information and registered photos
- **EXAM_ROSTERS**: Student-to-exam assignments
- **SEATING_PLANS**: Seating plan configurations
- **SEATS**: Individual seat records
- **CHECK_INS**: Check-in records with verification results
- **VIOLATIONS**: Violation records with evidence
- **AUDIT_LOGS**: System activity audit trail

**Key Relationships:**
- One-to-Many: EXAMS → EXAM_ROSTERS, EXAMS → CHECK_INS
- One-to-Many: STUDENTS → CHECK_INS, STUDENTS → VIOLATIONS
- One-to-Many: SEATING_PLANS → SEATS
- Many-to-One: CHECK_INS → USERS (Proctor)

---

### 3. Sequence Diagram - Check-In Workflow (`sequence_checkin.mmd` / `sequence_checkin.png`)

The Sequence diagram details the step-by-step interaction flow for the student check-in process with photo verification.

**Flow Steps:**
1. Proctor logs in and selects active exam
2. Proctor searches for student
3. System checks if student is in roster and not already checked in
4. Proctor captures student photo
5. System saves photo and retrieves registered photo
6. ML/CV Service performs SSIM-based photo comparison
7. System evaluates verification result (MATCH/NO_MATCH)
8. If NO_MATCH, proctor can override with notes
9. System checks for seat mismatch
10. System records check-in and updates seating plan
11. System logs audit entry

**Participants:**
- Proctor (User)
- Web Interface (Frontend)
- Backend API (Express.js)
- Database (MySQL)
- ML/CV Service (Python)
- File Storage (Filesystem)

---

### 4. Activity Diagram - Exam Day Workflow (`activity.mmd` / `activity.png`) [BONUS]

The Activity diagram illustrates the complete exam day workflow from proctor login to exam completion.

**Main Activities:**
1. **Login & Setup**: Proctor logs in and selects exam
2. **Student Arrival**: Wait for students and search by ID
3. **Roster Check**: Verify student is in roster and not checked in
4. **Photo Capture**: Capture and process student photo
5. **Identity Verification**: ML/CV verification with confidence score
6. **Decision Points**:
   - If MATCH: Proceed to seat check
   - If NO_MATCH: Proctor can override or reject
7. **Seat Verification**: Compare assigned vs actual seat
8. **Violation Recording**: Record mismatches automatically
9. **Check-In Completion**: Update seating plan and log audit
10. **Exam End**: Generate reports and update exam status

**Decision Points:**
- Student in roster?
- Already checked in?
- Verification result?
- Proctor override decision?
- Seat mismatch?
- More students?
- Exam time ended?

---

## Diagram Formats

All diagrams are available in two formats:
- **`.mmd`**: Mermaid diagram source code (text format)
- **`.png`**: Rendered PNG images for documentation

## How to Regenerate Diagrams

To regenerate PNG images from Mermaid source files:

```bash
cd diagrams
manus-render-diagram usecase.mmd usecase.png
manus-render-diagram erd.mmd erd.png
manus-render-diagram sequence_checkin.mmd sequence_checkin.png
manus-render-diagram activity.mmd activity.png
```

## Diagram Consistency

All diagrams are consistent with:
- Software Requirements Specification (SRS) document
- Database schema (`database/schema.sql`)
- Implementation code (`src/` directory)
- Test cases (`test-docs/test_cases.md`)

---

**Last Updated**: January 2026
