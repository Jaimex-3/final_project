# Test Cases - Exam Security System

| Test ID | Precondition | Steps | Input | Expected Result |
| --- | --- | --- | --- | --- |
| AUTH-001 | User exists with admin role | 1) POST /api/auth/login<br>2) GET /api/auth/me with token | email=admin@example.com, password=valid | 200 with JWT; /me 200 with user info role=admin |
| AUTH-002 | User exists with proctor role | 1) POST /api/auth/login<br>2) GET /api/admin/exams with proctor token | email=proctor@example.com, password=valid | Login 200; admin endpoint 403 (role blocked) |
| AUTH-003 (neg) | None | POST /api/auth/login | email=admin@example.com, bad password | 401 invalid credentials |
| EXAM-001 | Admin authenticated; room exists | POST /api/admin/exams | title, date, start_time, end_time, room_id | 201 with created exam (start/end combined with date) |
| EXAM-002 (neg) | Admin authenticated | POST /api/admin/exams missing fields | title only | 400 errors for required date/start_time/end_time/room_id |
| EXAM-003 (edge) | Admin authenticated | POST /api/admin/exams | start_time >= end_time | 400 end_time must be after start_time |
| ROSTER-001 | Exam exists; CSV prepared | POST /api/admin/exams/{exam_id}/roster/import-csv | CSV columns: student_no, full_name (20 rows) | 201 imported count=20; roster list shows 20 |
| ROSTER-002 (neg) | Exam has roster; CSV contains duplicate student_no | POST /api/admin/exams/{id}/roster/import-csv | CSV with duplicate student_no | 400 errors referencing duplicate student_no |
| SEATING-001 | Exam exists | POST /api/admin/exams/{id}/seating-plan | rows=4, cols=5 | 201 with 20 generated seats A1..D5 |
| SEATING-002 (neg) | Seating plan exists | POST /api/admin/exams/{id}/seat-assignments with duplicate seat/student | duplicate student_id or seat_code in payload | 400/409 indicating duplicate assignment rejected |
| CHECKIN-001 | Proctor authenticated; student in roster; assignment exists | POST /api/proctor/checkins multipart | exam_id, student_id, entered_seat_code matches assignment, photo | 201 decision_status=approved (is_face_match=true, is_seat_ok=true) |
| CHECKIN-002 (neg) | Prior check-in exists for same exam/student | POST /api/proctor/checkins twice | same payload | Second request 400 duplicate check-in |
| CHECKIN-003 (neg) | Proctor authenticated | POST /api/proctor/checkins without photo | exam_id, student_id, seat_code | 400 validation error for missing photo |
| CHECKIN-004 (edge) | FakeMLService returns multiple_faces_detected | POST /api/proctor/checkins | exam_id, student_id, seat_code, photo | 201 (or 400 per impl) with is_face_match=false, decision_status=pending, reason logged |
| CHECKIN-005 (edge) | Assignment exists but seat code differs | POST /api/proctor/checkins | entered_seat_code different from assigned | 201 decision_status pending/denied with is_seat_ok=false; recorded seat mismatch |
| VIOL-001 | Proctor authenticated; checkin exists | POST /api/proctor/violations multipart | exam_id, student_id, checkin_id, reason, evidence optional | 201 with violation linked to checkin |
| VIOL-002 (edit) | Violation exists | PUT /api/proctor/violations/{id} | reason updated, optional notes/evidence | 200 with updated fields persisted |
| VIOL-003 (delete) | Violation exists | DELETE /api/proctor/violations/{id} | none | 204; violation no longer returned in list |
| REPORT-001 | Data present: checkins/violations | GET /api/admin/reports/summary?exam_id=... | exam_id | 200 totals for checkins, face_mismatches, seat_mismatches, violations |
| REPORT-002 | Data present: checkins | GET /api/admin/reports/checkins?exam_id=&face_match=false | filters | 200 items filtered to non-matching faces |
| REPORT-003 | Data present: violations | GET /api/admin/reports/violations?exam_id= | exam_id | 200 items filtered by exam showing exam/student names |
| REPORT-004 (neg) | None | GET /api/admin/reports/checkins without auth | none | 401/403 unauthorized |
