# Test Cases - Exam Security System

| Test ID | Precondition | Steps | Input | Expected Result |
| --- | --- | --- | --- | --- |
| AUTH-001 | User exists with admin role | 1) POST /api/auth/login with valid email/password<br>2) GET /api/auth/me with returned token | email=admin@example.com, password=valid | Login 200 with JWT; /me returns 200 with user info and role=admin |
| AUTH-002 | User exists with proctor role | 1) POST /api/auth/login (proctor)<br>2) GET /api/admin/exams with proctor token | email=proctor@example.com, password=valid | Login 200; admin endpoint returns 403 (role blocked) |
| EXAM-001 | Admin authenticated | POST /api/admin/exams | title, date, start_time, end_time, room_id | 201 with created exam payload; persisted fields match |
| ROSTER-001 | Exam exists; CSV prepared | POST /api/admin/exams/{exam_id}/roster/import-csv | CSV columns: student_no, full_name (20 rows) | 201 with imported count=20; roster list returns 20 students |
| ROSTER-002 | Exam has roster; CSV contains duplicate student_no | POST /api/admin/exams/{id}/roster/import-csv | CSV with duplicate student_no | 400 with errors referencing duplicate student_no |
| SEATING-001 | Exam exists | POST /api/admin/exams/{id}/seating-plan | rows=4, cols=5 | 201 with 20 generated seats A1..D5 |
| SEATING-002 | Seating plan exists | POST /api/admin/exams/{id}/seat-assignments | assignments list of student_id->seat_code | 201 with items reflecting assignments; duplicates rejected |
| CHECKIN-001 | Proctor authenticated; student in roster; assignment exists | POST /api/proctor/checkins multipart | exam_id, student_id, entered_seat_code matches assignment, photo file | 201 decision_status=approved when ML match=true and seat_ok=true |
| CHECKIN-002 | Same student already checked in | POST /api/proctor/checkins twice | same payload | Second request returns 400 with duplicate check-in message |
| CHECKIN-003 | Missing image | POST /api/proctor/checkins without photo | exam_id, student_id, seat_code | 400 validation error for missing photo |
| CHECKIN-004 | ML reports multiple faces | Use FakeMLService returning reason=multiple_faces_detected | exam_id, student_id, seat_code, photo | 201 (or 400 per implementation) with is_face_match=false, decision_status=pending, reason logged |
| VIOL-001 | Proctor authenticated; checkin exists | POST /api/proctor/violations multipart | exam_id, student_id, checkin_id, reason, evidence image optional | 201 with violation payload linked to checkin |
| REPORT-001 | Data present: checkins/violations | GET /api/admin/reports/summary?exam_id=... | exam_id | 200 with totals for checkins, face_mismatches, seat_mismatches, violations |
| REPORT-002 | Data present: checkins | GET /api/admin/reports/checkins?exam_id=&face_match=false | filters | 200 items filtered to non-matching faces |
| REPORT-003 | Data present: violations | GET /api/admin/reports/violations?exam_id= | exam_id | 200 items filtered by exam |
