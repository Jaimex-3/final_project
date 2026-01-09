# Exam Security System - System Diagrams

**Version**: 2.0 (Updated)  
**Date**: January 2026  
**Project**: Exam Security System

---

## Overview

This directory contains all system diagrams for the Exam Security System project, created according to the requirements specification. All diagrams follow UML standards and are provided in both source (Mermaid) and rendered (PNG) formats.

---

## Diagram Inventory

### 1. Use Case Diagram

**File**: `usecase.mmd` / `usecase.png`

**Description**: Shows all actors (Administrator, Proctor, Student, ML Service) and their interactions with the system through use cases.

**Actors**:
- Administrator (Exam Coordinator)
- Proctor (Invigilator)
- Student (Exam Participant)
- ML Service (External System)

**Key Use Cases**:
- Login to System
- Create/Manage Exams
- Import Student Roster
- Create Seating Plan
- Verify Student Identity
- Record Check-In
- Record Violation
- Generate Reports

**Relationships**:
- `<<include>>`: Mandatory sub-processes (e.g., "Record Check-In" includes "Verify Student Identity")
- `<<extend>>`: Optional flows (e.g., "Record Violation" extends "Record Check-In")

---

### 2. Entity Relationship Diagram (ERD)

**Files**:
- Original: `erd.mmd` / `erd.png`
- Updated: `erd_updated.mmd` / `erd_updated.png` ✅ **RECOMMENDED**

**Description**: Complete database schema showing all entities (tables), attributes, and relationships.

**Entities (9 Tables)**:
1. **users**: System users (Admin, Proctor)
2. **rooms**: Exam room information (NEW in v2.0)
3. **exams**: Exam configurations
4. **students**: Student information and registered photos
5. **exam_rosters**: Student enrollment in exams
6. **seating_plans**: Seating plan configurations
7. **seat_assignments**: Student-to-seat mappings
8. **check_ins**: Check-in records with verification results
9. **violations**: Violation records with evidence
10. **audit_logs**: System activity audit trail

**Key Relationships**:
- users (1) → (N) exams (created_by)
- rooms (1) → (N) exams (hosts)
- exams (1) → (1) seating_plans
- seating_plans (1) → (N) seat_assignments
- students (1) → (N) check_ins
- check_ins (1) → (N) violations

**Updates in v2.0**:
- Added `rooms` table with room_code, capacity, building, floor
- Updated `exams` table with `room_id` foreign key
- Updated `seating_plans` table with `room_id` foreign key
- Renamed `seats` to `seat_assignments` for clarity
- Added `resolved_by` foreign key to `violations` table
- Enhanced field definitions (full_name, phone, enrollment_year, major)

---

### 3. Sequence Diagrams

#### 3.1. Check-In Workflow

**Files**:
- Original: `sequence_checkin.mmd` / `sequence_checkin.png`
- Detailed: `sequence_checkin_detailed.mmd` / `sequence_checkin_detailed.png` ✅ **RECOMMENDED**

**Description**: Complete workflow for student check-in with identity verification and seat compliance checking.

**Participants**:
- Proctor (actor)
- Web Interface (frontend)
- Backend Server (API)
- ML Service (face recognition)
- Database
- File Storage

**Key Steps**:
1. Proctor searches for student
2. System retrieves student info and assigned seat
3. Proctor captures live photo
4. ML Service verifies photo (SSIM algorithm)
5. System checks seat compliance
6. Proctor confirms or overrides verification
7. System records check-in
8. System creates violations if mismatches detected
9. Audit log entry created

**Alternative Flows**:
- Low confidence verification (< 75%)
- Proctor override with notes
- Seat mismatch detection
- Identity mismatch detection

---

#### 3.2. Violation Recording Workflow

**File**: `sequence_violation.mmd` / `sequence_violation.png` ✅ **NEW**

**Description**: Workflow for recording exam violations with evidence attachment.

**Participants**:
- Proctor (actor)
- Web Interface
- Backend Server
- Database
- File Storage

**Key Steps**:
1. Proctor clicks "Record Violation"
2. System retrieves check-in and student context
3. Proctor selects violation type, severity, and description
4. Proctor optionally uploads evidence photo
5. System saves violation record
6. System creates audit log entry
7. Confirmation displayed to proctor

**Violation Types**:
- Identity Mismatch
- Seat Mismatch
- Unauthorized Materials
- Disruptive Behavior
- Late Arrival
- Other

---

#### 3.3. Report Generation Workflow

**File**: `sequence_reporting.mmd` / `sequence_reporting.png` ✅ **NEW**

**Description**: Workflow for generating and exporting exam reports.

**Participants**:
- Administrator (actor)
- Web Interface
- Backend Server
- Database
- Report Generator Service
- File Storage

**Key Steps**:
1. Admin navigates to Reports page
2. Admin selects report type and filters
3. System executes complex JOIN queries
4. Report Generator formats data and calculates statistics
5. System displays report in web interface
6. Admin can export to CSV or PDF
7. Audit log entry created

**Report Types**:
- Check-In Report
- Mismatch Report (identity + seat)
- Violation Report
- Summary Report

---

### 4. Activity Diagram (BONUS)

**File**: `activity.mmd` / `activity.png`

**Description**: High-level workflow showing the complete exam day process from login to completion.

**Swimlanes**:
- Administrator
- Proctor
- System

**Key Activities**:
- Exam setup and configuration
- Seating plan creation
- Student check-in process
- Violation handling
- Exam completion
- Report generation

---

## Diagram Specifications

### Technical Details

**Format**: Mermaid (text-based diagram definition language)

**Rendering**: PNG images at high resolution (300 DPI minimum)

**Notation Standards**:
- Use Case: UML 2.5 standard notation
- ERD: Crow's Foot notation
- Sequence: UML 2.5 sequence diagram notation
- Activity: UML 2.5 activity diagram notation

### File Naming Convention

- Source files: `{diagram_type}.mmd`
- Rendered images: `{diagram_type}.png`
- Updated versions: `{diagram_type}_updated.mmd/png`

---

## How to Regenerate Diagrams

All diagrams can be regenerated from source files using the `manus-render-diagram` utility:

```bash
# Regenerate single diagram
manus-render-diagram usecase.mmd usecase.png

# Regenerate all diagrams
for file in *.mmd; do
    manus-render-diagram "$file" "${file%.mmd}.png"
done
```

---

## Diagram Quality Checklist

✅ **Professional Appearance**:
- Clear, readable labels (12pt font minimum)
- Consistent color scheme
- Proper alignment and spacing
- No overlapping elements

✅ **Technical Accuracy**:
- Follows UML standards
- Accurate representation of SRS requirements
- All entities/actors from SRS are represented
- Relationships match database schema
- Sequence flows match functional requirements

✅ **Academic Requirements**:
- High resolution for printing (300 DPI)
- Can be read in black and white if printed
- Includes diagram context and purpose

---

## Diagram Updates Summary

### Version 2.0 Changes (January 2026)

1. **ERD Updates**:
   - Added `rooms` table
   - Updated foreign key relationships
   - Enhanced field definitions
   - Improved cardinality notation

2. **New Sequence Diagrams**:
   - Violation Recording Workflow
   - Report Generation Workflow
   - Detailed Check-In Workflow (with alternative flows)

3. **Enhanced Documentation**:
   - Added business rules section to SRS
   - Updated README with complete diagram inventory
   - Added regeneration instructions

---

## References

- **SRS Document**: `../analysis/SRS_Document.md`
- **Database Schema**: `../database/schema_updated.sql`
- **Requirements**: `../upload/diagram_creation_prompt.md`

---

**Last Updated**: January 9, 2026  
**Maintained By**: Development Team
