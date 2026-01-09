# Test Cases Document
## Exam Security System

**Version**: 1.0  
**Date**: January 2026  
**Project**: Exam Security System

---

## Table of Contents

1. [Functional Test Cases](#functional-test-cases)
2. [Negative Test Cases](#negative-test-cases)
3. [Edge Cases](#edge-cases)
4. [Unit Test Cases](#unit-test-cases)

---

## Functional Test Cases

### Authentication

#### TC-001: Valid Login with Correct Credentials
- **Test ID**: TC-001
- **Precondition**: User account exists with username 'admin1' and password 'Test123!'
- **Steps**:
  1. Navigate to login page
  2. Enter username 'admin1'
  3. Enter password 'Test123!'
  4. Click Login button
- **Expected Result**: User is authenticated and redirected to dashboard
- **Status**: PASS
- **Notes**: Token generated successfully

#### TC-002: Invalid Login with Wrong Password
- **Test ID**: TC-002
- **Precondition**: User account exists with username 'admin1'
- **Steps**:
  1. Navigate to login page
  2. Enter username 'admin1'
  3. Enter password 'WrongPassword'
  4. Click Login button
- **Expected Result**: Error message "Invalid username or password" is displayed
- **Status**: PASS
- **Notes**: Authentication rejected as expected

#### TC-003: Session Timeout After 30 Minutes
- **Test ID**: TC-003
- **Precondition**: User is logged in
- **Steps**:
  1. Login successfully
  2. Wait for 30 minutes without activity
  3. Attempt to access protected resource
- **Expected Result**: User is redirected to login page with session expired message
- **Status**: PASS
- **Notes**: Token expiration working correctly

---

### Exam Management

#### TC-004: Create New Exam (Admin)
- **Test ID**: TC-004
- **Precondition**: User is logged in as Admin
- **Steps**:
  1. Navigate to exam management page
  2. Click "Create Exam" button
  3. Enter exam code: "TEST-001"
  4. Enter exam name: "Test Exam"
  5. Select date: 2026-02-01
  6. Select time: 09:00
  7. Enter room: "A-101"
  8. Enter duration: 120 minutes
  9. Enter capacity: 50
  10. Click "Save"
- **Expected Result**: Exam is created successfully with status "DRAFT"
- **Status**: PASS
- **Notes**: Audit log entry created

#### TC-005: Update Exam Status (Admin)
- **Test ID**: TC-005
- **Precondition**: Exam exists with status "DRAFT"
- **Steps**:
  1. Navigate to exam details
  2. Click "Change Status"
  3. Select "ACTIVE"
  4. Click "Confirm"
- **Expected Result**: Exam status is updated to "ACTIVE"
- **Status**: PASS
- **Notes**: Status transition validated

#### TC-006: Delete Exam (Admin)
- **Test ID**: TC-006
- **Precondition**: Exam exists with no check-ins
- **Steps**:
  1. Navigate to exam list
  2. Click "Delete" on exam
  3. Confirm deletion
- **Expected Result**: Exam is deleted and removed from list
- **Status**: PASS
- **Notes**: Cascade delete removes related records

---

### Student Roster Management

#### TC-007: Import Student Roster via CSV
- **Test ID**: TC-007
- **Precondition**: Valid CSV file with student data exists
- **Steps**:
  1. Navigate to roster management
  2. Click "Import CSV"
  3. Select file with 10 students
  4. Click "Upload"
- **Expected Result**: All 10 students are imported successfully
- **Status**: PASS
- **Notes**: Duplicate detection working

#### TC-008: Manual Student Entry
- **Test ID**: TC-008
- **Precondition**: User is logged in as Admin
- **Steps**:
  1. Navigate to roster management
  2. Click "Add Student"
  3. Enter student number: "S999"
  4. Enter first name: "John"
  5. Enter last name: "Doe"
  6. Enter email: "john.doe@student.edu"
  7. Click "Save"
- **Expected Result**: Student is added to roster
- **Status**: PASS
- **Notes**: Validation rules enforced

---

### Seating Plan Management

#### TC-009: Create Grid-Based Seating Plan
- **Test ID**: TC-009
- **Precondition**: Exam exists with roster
- **Steps**:
  1. Navigate to seating plan management
  2. Click "Create Seating Plan"
  3. Select plan type: "Grid"
  4. Enter rows: 5
  5. Enter columns: 6
  6. Click "Generate"
- **Expected Result**: Seating plan with 30 seats is created
- **Status**: PASS
- **Notes**: Seats auto-generated with codes A1-F5

#### TC-010: Assign Students to Seats (Automatic)
- **Test ID**: TC-010
- **Precondition**: Seating plan exists with 30 seats, 25 students in roster
- **Steps**:
  1. Navigate to seating plan
  2. Click "Auto Assign"
  3. Select assignment method: "Random"
  4. Click "Confirm"
- **Expected Result**: All 25 students are assigned to random seats
- **Status**: PASS
- **Notes**: No duplicate seat assignments

---

### Check-In Workflow

#### TC-011: Check-In with Matching Photo
- **Test ID**: TC-011
- **Precondition**: Student is in roster, registered photo exists
- **Steps**:
  1. Navigate to check-in page
  2. Search for student by ID: "S001"
  3. Capture photo (matching registered photo)
  4. Click "Submit"
  5. Wait for verification
- **Expected Result**: Verification result is "MATCH" with confidence > 70%
- **Status**: PASS
- **Notes**: ML service returned 95.5% confidence

#### TC-012: Check-In with Non-Matching Photo
- **Test ID**: TC-012
- **Precondition**: Student is in roster, registered photo exists
- **Steps**:
  1. Navigate to check-in page
  2. Search for student by ID: "S002"
  3. Capture photo (different person)
  4. Click "Submit"
  5. Wait for verification
- **Expected Result**: Verification result is "NO_MATCH" with confidence < 70%
- **Status**: PASS
- **Notes**: Violation automatically created

#### TC-013: Check-In with Seat Mismatch
- **Test ID**: TC-013
- **Precondition**: Student assigned to seat "A1"
- **Steps**:
  1. Complete check-in process
  2. Enter actual seat: "B3"
  3. Click "Complete Check-In"
- **Expected Result**: Check-in is recorded, violation is created for seat mismatch
- **Status**: PASS
- **Notes**: Severity set to "LOW"

#### TC-014: Manual Override of Verification Result
- **Test ID**: TC-014
- **Precondition**: Check-in completed with "NO_MATCH" result
- **Steps**:
  1. Navigate to check-in details
  2. Click "Override"
  3. Enter notes: "Student wearing glasses"
  4. Click "Confirm Override"
- **Expected Result**: Verification result is updated to "OVERRIDE"
- **Status**: PASS
- **Notes**: Audit log entry created

---

### Violation Recording

#### TC-015: Record Violation with Evidence
- **Test ID**: TC-015
- **Precondition**: Exam is active, student is checked in
- **Steps**:
  1. Navigate to violations page
  2. Click "Record Violation"
  3. Select student: "S005"
  4. Select category: "UNAUTHORIZED_MATERIALS"
  5. Enter reason: "Student has unauthorized calculator"
  6. Select severity: "HIGH"
  7. Upload evidence photo
  8. Click "Submit"
- **Expected Result**: Violation is recorded with evidence
- **Status**: PASS
- **Notes**: Evidence photo stored successfully

#### TC-016: Update Violation Status
- **Test ID**: TC-016
- **Precondition**: Violation exists with status "RECORDED"
- **Steps**:
  1. Navigate to violation details
  2. Click "Update Status"
  3. Select new status: "REVIEWED"
  4. Click "Confirm"
- **Expected Result**: Violation status is updated to "REVIEWED"
- **Status**: PASS
- **Notes**: Reviewed by and timestamp recorded

---

### Reporting

#### TC-017: Generate Check-In Report
- **Test ID**: TC-017
- **Precondition**: Exam has check-ins
- **Steps**:
  1. Navigate to reports page
  2. Select report type: "Check-In Report"
  3. Select exam: "CS101 Final"
  4. Click "Generate"
- **Expected Result**: Report displays all check-ins with timestamps and verification results
- **Status**: PASS
- **Notes**: Export to CSV working

#### TC-018: Generate Mismatch Report
- **Test ID**: TC-018
- **Precondition**: Exam has mismatches
- **Steps**:
  1. Navigate to reports page
  2. Select report type: "Mismatch Report"
  3. Select exam: "MATH201 Midterm"
  4. Click "Generate"
- **Expected Result**: Report displays all identity and seat mismatches
- **Status**: PASS
- **Notes**: Filtering by type working

#### TC-019: Generate Violation Report
- **Test ID**: TC-019
- **Precondition**: Exam has violations
- **Steps**:
  1. Navigate to reports page
  2. Select report type: "Violation Report"
  3. Select exam: "MATH201 Midterm"
  4. Filter by category: "IDENTITY_MISMATCH"
  5. Click "Generate"
- **Expected Result**: Report displays filtered violations
- **Status**: PASS
- **Notes**: Export to PDF working

---

## Negative Test Cases

### TC-020: Login with Empty Username
- **Test ID**: TC-020
- **Steps**:
  1. Navigate to login page
  2. Leave username empty
  3. Enter password
  4. Click Login
- **Expected Result**: Error message "Username and password are required"
- **Status**: PASS

### TC-021: Create Exam with Duplicate Code
- **Test ID**: TC-021
- **Steps**:
  1. Create exam with code "CS101-FINAL-2026"
  2. Attempt to create another exam with same code
- **Expected Result**: Error message "Exam code already exists"
- **Status**: PASS

### TC-022: Import CSV with Invalid Data
- **Test ID**: TC-022
- **Steps**:
  1. Upload CSV with missing required fields
- **Expected Result**: Error message listing invalid rows
- **Status**: PASS

### TC-023: Check-In Without Photo
- **Test ID**: TC-023
- **Steps**:
  1. Initiate check-in
  2. Skip photo capture
  3. Click Submit
- **Expected Result**: Error message "Photo is required for check-in"
- **Status**: PASS

### TC-024: Assign More Students Than Seats
- **Test ID**: TC-024
- **Steps**:
  1. Create seating plan with 20 seats
  2. Attempt to assign 25 students
- **Expected Result**: Error message "Insufficient seats"
- **Status**: PASS

### TC-025: Proctor Attempts to Create Exam
- **Test ID**: TC-025
- **Steps**:
  1. Login as Proctor
  2. Attempt to access exam creation page
- **Expected Result**: Error message "Insufficient permissions"
- **Status**: PASS

### TC-026: Duplicate Check-In
- **Test ID**: TC-026
- **Steps**:
  1. Complete check-in for student S001
  2. Attempt to check-in same student again
- **Expected Result**: Error message "Student already checked in"
- **Status**: PASS

### TC-027: Invalid Exam Date (Past Date)
- **Test ID**: TC-027
- **Steps**:
  1. Create exam with date in the past
- **Expected Result**: Error message "Exam date must be in the future"
- **Status**: PASS

### TC-028: Invalid Seat Code
- **Test ID**: TC-028
- **Steps**:
  1. Enter actual seat: "Z99" (non-existent)
- **Expected Result**: Error message "Invalid seat code"
- **Status**: PASS

### TC-029: Upload Oversized Photo
- **Test ID**: TC-029
- **Steps**:
  1. Attempt to upload photo > 5MB
- **Expected Result**: Error message "File size exceeds limit"
- **Status**: PASS

---

## Edge Cases

### TC-030: Multiple Concurrent Check-Ins
- **Test ID**: TC-030
- **Steps**:
  1. Two proctors check-in different students simultaneously
- **Expected Result**: Both check-ins complete successfully without conflicts
- **Status**: PASS

### TC-031: Photo with Multiple Faces
- **Test ID**: TC-031
- **Steps**:
  1. Upload photo containing multiple faces
- **Expected Result**: ML service detects multiple faces, verification fails
- **Status**: PASS

### TC-032: Photo with No Face
- **Test ID**: TC-032
- **Steps**:
  1. Upload photo with no detectable face
- **Expected Result**: Error message "No face detected in photo"
- **Status**: PASS

### TC-033: Import Large Roster (500 Students)
- **Test ID**: TC-033
- **Steps**:
  1. Import CSV with 500 students
- **Expected Result**: All students imported within 30 seconds
- **Status**: PASS

### TC-034: Generate Report for 500 Students
- **Test ID**: TC-034
- **Steps**:
  1. Generate check-in report for exam with 500 students
- **Expected Result**: Report generated within 30 seconds
- **Status**: PASS

### TC-035: Network Interruption During Photo Upload
- **Test ID**: TC-035
- **Steps**:
  1. Start photo upload
  2. Disconnect network
  3. Reconnect network
- **Expected Result**: Error message "Upload failed, please try again"
- **Status**: PASS

### TC-036: Session Expires During Check-In
- **Test ID**: TC-036
- **Steps**:
  1. Start check-in process
  2. Wait for token to expire
  3. Complete check-in
- **Expected Result**: User redirected to login page
- **Status**: PASS

### TC-037: Missing Registered Photo
- **Test ID**: TC-037
- **Steps**:
  1. Check-in student with no registered photo
- **Expected Result**: Verification skipped, manual confirmation required
- **Status**: PASS

### TC-038: Exam at Midnight (00:00)
- **Test ID**: TC-038
- **Steps**:
  1. Create exam with time 00:00
- **Expected Result**: Exam created successfully
- **Status**: PASS

### TC-039: Student Name with Special Characters
- **Test ID**: TC-039
- **Steps**:
  1. Add student with name "O'Brien"
- **Expected Result**: Student added successfully
- **Status**: PASS

---

## Unit Test Cases

### UT-001: Password Hashing
- **Test ID**: UT-001
- **Function**: `bcrypt.hash()`
- **Input**: "Test123!"
- **Expected Result**: Hashed password string, different from input
- **Status**: PASS

### UT-002: Password Verification
- **Test ID**: UT-002
- **Function**: `bcrypt.compare()`
- **Input**: Plain password and hash
- **Expected Result**: Returns true for correct password, false for incorrect
- **Status**: PASS

### UT-003: JWT Token Generation
- **Test ID**: UT-003
- **Function**: `generateToken()`
- **Input**: User object
- **Expected Result**: Valid JWT token string
- **Status**: PASS

### UT-004: JWT Token Validation
- **Test ID**: UT-004
- **Function**: `jwt.verify()`
- **Input**: Valid token
- **Expected Result**: Decoded user object
- **Status**: PASS

### UT-005: Seat Assignment Validation
- **Test ID**: UT-005
- **Function**: Seat assignment logic
- **Input**: 30 seats, 25 students
- **Expected Result**: All students assigned, no duplicates
- **Status**: PASS

### UT-006: Duplicate Check-In Detection
- **Test ID**: UT-006
- **Function**: Check-in validation
- **Input**: Student ID already checked in
- **Expected Result**: Returns error
- **Status**: PASS

### UT-007: Violation Category Validation
- **Test ID**: UT-007
- **Function**: Violation validation
- **Input**: Invalid category "INVALID_CATEGORY"
- **Expected Result**: Returns error
- **Status**: PASS

### UT-008: Confidence Score Calculation
- **Test ID**: UT-008
- **Function**: ML service SSIM calculation
- **Input**: Two identical images
- **Expected Result**: Confidence score ≈ 100%
- **Status**: PASS

### UT-009: Confidence Score Threshold
- **Test ID**: UT-009
- **Function**: Verification decision logic
- **Input**: Confidence score 65%
- **Expected Result**: Result is "NO_MATCH" (below 70% threshold)
- **Status**: PASS

### UT-010: Audit Log Creation
- **Test ID**: UT-010
- **Function**: `logAudit()`
- **Input**: User action data
- **Expected Result**: Audit log entry created in database
- **Status**: PASS

### UT-011: Role-Based Access Check
- **Test ID**: UT-011
- **Function**: `requireAdmin()`
- **Input**: User with role "PROCTOR"
- **Expected Result**: Access denied
- **Status**: PASS

### UT-012: Date Validation
- **Test ID**: UT-012
- **Function**: Exam date validation
- **Input**: Date in the past
- **Expected Result**: Validation error
- **Status**: PASS

### UT-013: Email Format Validation
- **Test ID**: UT-013
- **Function**: Email validation
- **Input**: "invalid-email"
- **Expected Result**: Validation error
- **Status**: PASS

### UT-014: File Type Validation
- **Test ID**: UT-014
- **Function**: Photo upload validation
- **Input**: PDF file
- **Expected Result**: Validation error "Only JPEG and PNG allowed"
- **Status**: PASS

### UT-015: ML Service Error Handling
- **Test ID**: UT-015
- **Function**: ML service wrapper
- **Input**: Non-existent file path
- **Expected Result**: Error object with success: false
- **Status**: PASS

---

## Test Summary

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Functional | 19 | 19 | 0 | 100% |
| Negative | 10 | 10 | 0 | 100% |
| Edge Cases | 10 | 10 | 0 | 100% |
| Unit Tests | 15 | 15 | 0 | 100% |
| **Total** | **54** | **54** | **0** | **100%** |

---

## Notes

- All tests executed on January 9, 2026
- Test environment: Development
- Database: MySQL 8.0
- Node.js version: 22.13.0
- Python version: 3.11.0

---

**Document Version**: 1.0  
**Last Updated**: January 2026
