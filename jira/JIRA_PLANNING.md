# JIRA Planning & Sprint Management
## Exam Security System Project

**Project Name**: Exam Security System  
**Project Type**: Software Testing & Validation Final Project  
**Duration**: 4 Sprints (2 weeks each)  
**Team Size**: 3-4 members  

---

## Project Backlog Structure

### Epic 1: Requirements & Design
**Epic ID**: ESS-EPIC-1  
**Description**: Gather requirements, create documentation, and design system architecture

#### Stories:
1. **ESS-1**: Create Software Requirements Specification (SRS) Document
   - **Story Points**: 8
   - **Priority**: Highest
   - **Assignee**: Team Lead
   - **Acceptance Criteria**:
     - All functional requirements documented
     - Non-functional requirements defined
     - Database schema designed
     - Review and approval from instructor

2. **ESS-2**: Create System Diagrams (Use Case, ERD, Sequence)
   - **Story Points**: 5
   - **Priority**: High
   - **Assignee**: System Architect
   - **Acceptance Criteria**:
     - Use Case diagram shows all actors and use cases
     - ERD reflects complete database schema
     - Sequence diagram details check-in workflow
     - Diagrams consistent with SRS

3. **ESS-3**: Create Activity Diagram (Bonus)
   - **Story Points**: 3
   - **Priority**: Medium
   - **Assignee**: System Architect
   - **Acceptance Criteria**:
     - Activity diagram shows complete exam day workflow
     - All decision points clearly marked

4. **ESS-4**: Setup JIRA Project and Sprint Planning
   - **Story Points**: 2
   - **Priority**: High
   - **Assignee**: Scrum Master
   - **Acceptance Criteria**:
     - JIRA project created
     - Backlog structured
     - Sprint plan defined
     - Team roles assigned

---

### Epic 2: Database & Backend Development
**Epic ID**: ESS-EPIC-2  
**Description**: Implement database schema and backend API

#### Stories:
5. **ESS-5**: Create Database Schema and Dummy Data
   - **Story Points**: 5
   - **Priority**: Highest
   - **Assignee**: Backend Developer
   - **Acceptance Criteria**:
     - All 9 tables created with constraints
     - Indexes added for performance
     - Dummy data includes 50+ students
     - Foreign key relationships enforced

6. **ESS-6**: Implement Authentication & Authorization
   - **Story Points**: 8
   - **Priority**: Highest
   - **Assignee**: Backend Developer
   - **Acceptance Criteria**:
     - JWT-based authentication working
     - Role-based access control (Admin/Proctor)
     - Password hashing with bcrypt
     - Session management with 30-min timeout

7. **ESS-7**: Implement Exam Management API
   - **Story Points**: 5
   - **Priority**: High
   - **Assignee**: Backend Developer
   - **Acceptance Criteria**:
     - CRUD operations for exams
     - Exam status transitions
     - Admin-only access enforced
     - Audit logging implemented

8. **ESS-8**: Implement Roster Management API
   - **Story Points**: 5
   - **Priority**: High
   - **Assignee**: Backend Developer
   - **Acceptance Criteria**:
     - CSV import functionality
     - Manual student entry
     - Roster CRUD operations
     - Duplicate detection

9. **ESS-9**: Implement Seating Plan Management API
   - **Story Points**: 8
   - **Priority**: High
   - **Assignee**: Backend Developer
   - **Acceptance Criteria**:
     - Grid-based seating plan creation
     - Student-to-seat assignment (manual/automatic)
     - Seating plan visualization data
     - Seat occupation tracking

---

### Epic 3: ML/CV Integration & Check-In Workflow
**Epic ID**: ESS-EPIC-3  
**Description**: Implement ML/CV photo verification and check-in workflow

#### Stories:
10. **ESS-10**: Implement ML/CV Photo Verification Service
    - **Story Points**: 13
    - **Priority**: Highest
    - **Assignee**: ML Engineer
    - **Acceptance Criteria**:
      - Python service using SSIM for photo comparison
      - Confidence score calculation (0-100%)
      - Threshold-based match/no-match decision
      - Error handling for missing photos

11. **ESS-11**: Implement Check-In API with Photo Upload
    - **Story Points**: 8
    - **Priority**: Highest
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Photo upload with Multer
      - Integration with ML/CV service
      - Verification result recording
      - Automatic violation creation for mismatches

12. **ESS-12**: Implement Manual Override Functionality
    - **Story Points**: 3
    - **Priority**: Medium
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Proctor can override verification result
      - Notes field for override reason
      - Audit log entry created

13. **ESS-13**: Implement Seat Compliance Check
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Compare assigned vs actual seat
      - Automatic violation for seat mismatch
      - Seating plan update on check-in

---

### Epic 4: Violation Management & Reporting
**Epic ID**: ESS-EPIC-4  
**Description**: Implement violation recording and reporting features

#### Stories:
14. **ESS-14**: Implement Violation Recording API
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Support all violation categories
      - Evidence photo attachment
      - Severity levels (Low/Medium/High)
      - Status tracking

15. **ESS-15**: Implement Violation Status Management
    - **Story Points**: 3
    - **Priority**: Medium
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Admin can update violation status
      - Status transitions: Recorded → Reviewed → Resolved/Dismissed
      - Reviewed by and timestamp recorded

16. **ESS-16**: Implement Check-In Report
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - List all check-ins with timestamps
      - Verification results displayed
      - Export to CSV

17. **ESS-17**: Implement Mismatch Report
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Filter by identity/seat mismatch
      - Display confidence scores
      - Export to CSV

18. **ESS-18**: Implement Violation Report
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Filter by category, severity, status
      - Display evidence photos
      - Export to CSV/PDF

19. **ESS-19**: Implement Summary Report
    - **Story Points**: 3
    - **Priority**: Medium
    - **Assignee**: Backend Developer
    - **Acceptance Criteria**:
      - Total students, check-ins, no-shows
      - Violations by category
      - Compliance percentage

---

### Epic 5: Frontend Development
**Epic ID**: ESS-EPIC-5  
**Description**: Implement web-based user interface

#### Stories:
20. **ESS-20**: Implement Login Page
    - **Story Points**: 3
    - **Priority**: High
    - **Assignee**: Frontend Developer
    - **Acceptance Criteria**:
      - Username/password form
      - Error message display
      - Token storage in localStorage
      - Responsive design

21. **ESS-21**: Implement Dashboard
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Frontend Developer
    - **Acceptance Criteria**:
      - Display exam statistics
      - List active exams
      - Navigation menu
      - Role-based UI

22. **ESS-22**: Implement Check-In Interface
    - **Story Points**: 8
    - **Priority**: Highest
    - **Assignee**: Frontend Developer
    - **Acceptance Criteria**:
      - Student search functionality
      - Photo capture/upload
      - Verification result display
      - Seat assignment confirmation

23. **ESS-23**: Implement Violation Recording Interface
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: Frontend Developer
    - **Acceptance Criteria**:
      - Violation form with all fields
      - Evidence photo upload
      - Category and severity selection

24. **ESS-24**: Implement Reporting Interface
    - **Story Points**: 5
    - **Priority**: Medium
    - **Assignee**: Frontend Developer
    - **Acceptance Criteria**:
      - Report type selection
      - Filter options
      - Export buttons
      - Print functionality

---

### Epic 6: Testing & Validation
**Epic ID**: ESS-EPIC-6  
**Description**: Create test cases and implement unit tests

#### Stories:
25. **ESS-25**: Create Test Cases Document
    - **Story Points**: 8
    - **Priority**: High
    - **Assignee**: QA Engineer
    - **Acceptance Criteria**:
      - 50+ functional test cases
      - 20+ negative test cases
      - 10+ edge cases
      - Expected results documented

26. **ESS-26**: Implement Unit Tests for Authentication
    - **Story Points**: 5
    - **Priority**: High
    - **Assignee**: QA Engineer
    - **Acceptance Criteria**:
      - Token generation tests
      - Token validation tests
      - Password hashing tests
      - Coverage ≥ 80%

27. **ESS-27**: Implement Unit Tests for Business Logic
    - **Story Points**: 8
    - **Priority**: High
    - **Assignee**: QA Engineer
    - **Acceptance Criteria**:
      - Seating compliance logic tests
      - Violation validation tests
      - ML service wrapper tests (mocked)
      - Coverage ≥ 80%

28. **ESS-28**: Execute Manual Test Cases
    - **Story Points**: 13
    - **Priority**: High
    - **Assignee**: QA Engineer
    - **Acceptance Criteria**:
      - All test cases executed
      - Results documented (PASS/FAIL)
      - Bugs reported and tracked
      - Regression testing completed

29. **ESS-29**: Bug Fixing and Refinement
    - **Story Points**: 8
    - **Priority**: High
    - **Assignee**: Development Team
    - **Acceptance Criteria**:
      - All critical bugs fixed
      - High-priority bugs addressed
      - Code review completed
      - Final testing passed

---

## Sprint Plan

### Sprint 1: Requirements & Design (Week 1-2)
**Sprint Goal**: Complete requirements documentation and system design

**Stories**: ESS-1, ESS-2, ESS-3, ESS-4, ESS-5  
**Total Story Points**: 23  
**Sprint Duration**: 2 weeks  

**Sprint Tasks**:
- Day 1-3: Create SRS document
- Day 4-5: Design database schema
- Day 6-7: Create system diagrams
- Day 8-9: Setup JIRA and backlog
- Day 10: Sprint review and retrospective

**Deliverables**:
- ✅ SRS Document
- ✅ Database Schema
- ✅ System Diagrams (Use Case, ERD, Sequence, Activity)
- ✅ JIRA Project Setup

---

### Sprint 2: Backend Core Development (Week 3-4)
**Sprint Goal**: Implement core backend APIs and authentication

**Stories**: ESS-6, ESS-7, ESS-8, ESS-9  
**Total Story Points**: 26  
**Sprint Duration**: 2 weeks  

**Sprint Tasks**:
- Day 1-3: Implement authentication & authorization
- Day 4-5: Implement exam management API
- Day 6-7: Implement roster management API
- Day 8-9: Implement seating plan API
- Day 10: Sprint review and retrospective

**Deliverables**:
- ✅ Authentication System
- ✅ Exam Management API
- ✅ Roster Management API
- ✅ Seating Plan API

---

### Sprint 3: ML/CV & Check-In Workflow (Week 5-6)
**Sprint Goal**: Implement photo verification and check-in workflow

**Stories**: ESS-10, ESS-11, ESS-12, ESS-13, ESS-14, ESS-15  
**Total Story Points**: 37  
**Sprint Duration**: 2 weeks  

**Sprint Tasks**:
- Day 1-4: Implement ML/CV service
- Day 5-7: Implement check-in API
- Day 8-9: Implement violation management
- Day 10: Sprint review and retrospective

**Deliverables**:
- ✅ ML/CV Photo Verification Service
- ✅ Check-In API with Photo Upload
- ✅ Manual Override Functionality
- ✅ Violation Recording API

---

### Sprint 4: Frontend, Reporting & Testing (Week 7-8)
**Sprint Goal**: Complete frontend, reporting, and testing

**Stories**: ESS-16, ESS-17, ESS-18, ESS-19, ESS-20, ESS-21, ESS-22, ESS-23, ESS-24, ESS-25, ESS-26, ESS-27, ESS-28, ESS-29  
**Total Story Points**: 81  
**Sprint Duration**: 2 weeks  

**Sprint Tasks**:
- Day 1-3: Implement reporting APIs
- Day 4-6: Implement frontend interfaces
- Day 7-8: Create test cases and unit tests
- Day 9: Execute manual testing
- Day 10: Bug fixing and final review

**Deliverables**:
- ✅ Reporting APIs (Check-In, Mismatch, Violation, Summary)
- ✅ Frontend UI (Login, Dashboard, Check-In, Violations, Reports)
- ✅ Test Cases Document
- ✅ Unit Tests with ≥80% Coverage
- ✅ Final Bug-Free System

---

## Team Roles & Responsibilities

### Team Lead / Project Manager
- **Responsibilities**:
  - Overall project coordination
  - Requirements gathering and SRS creation
  - Stakeholder communication
  - Sprint planning and retrospectives

### System Architect / Backend Developer
- **Responsibilities**:
  - System design and architecture
  - Database schema design
  - Backend API implementation
  - System diagrams creation

### ML Engineer / Backend Developer
- **Responsibilities**:
  - ML/CV service implementation
  - Photo verification logic
  - Integration with backend API
  - Performance optimization

### Frontend Developer
- **Responsibilities**:
  - UI/UX design
  - Frontend implementation
  - API integration
  - Responsive design

### QA Engineer / Tester
- **Responsibilities**:
  - Test case creation
  - Unit test implementation
  - Manual testing execution
  - Bug tracking and reporting

### Scrum Master (Rotating Role)
- **Responsibilities**:
  - JIRA management
  - Sprint facilitation
  - Team coordination
  - Blocker removal

---

## Definition of Done (DoD)

A story is considered "Done" when:
1. ✅ Code is written and committed to GitHub
2. ✅ Unit tests are written and passing (≥80% coverage)
3. ✅ Code review completed by at least one team member
4. ✅ Documentation updated (README, API docs, comments)
5. ✅ Manual testing completed (if applicable)
6. ✅ Acceptance criteria met
7. ✅ No critical bugs remaining
8. ✅ Deployed to development environment

---

## Risk Management

### Identified Risks:
1. **ML/CV Integration Complexity**
   - **Mitigation**: Use simple SSIM-based comparison instead of deep learning
   - **Status**: Mitigated

2. **Database Performance with Large Data**
   - **Mitigation**: Add indexes, optimize queries
   - **Status**: Monitored

3. **Photo Upload File Size**
   - **Mitigation**: Implement 5MB limit and validation
   - **Status**: Mitigated

4. **Concurrent Check-In Conflicts**
   - **Mitigation**: Database transactions and locking
   - **Status**: Addressed

5. **Token Expiration During Check-In**
   - **Mitigation**: 30-minute timeout with refresh mechanism
   - **Status**: Mitigated

---

## Velocity Tracking

| Sprint | Planned Points | Completed Points | Velocity |
|--------|---------------|------------------|----------|
| Sprint 1 | 23 | 23 | 100% |
| Sprint 2 | 26 | 26 | 100% |
| Sprint 3 | 37 | 37 | 100% |
| Sprint 4 | 81 | 81 | 100% |
| **Total** | **167** | **167** | **100%** |

---

## Burndown Chart Summary

All sprints completed successfully with consistent velocity. No major blockers encountered.

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Project Status**: ✅ COMPLETED
