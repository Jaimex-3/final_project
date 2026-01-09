from pathlib import Path

import pytest
from werkzeug.datastructures import FileStorage

from app.extensions import db
from app.models import Checkin, Seat, SeatAssignment, SeatingPlan
from app.services import checkin_service
from app.services.ml_service import FakeMLService


def make_file(tmp_path, name="photo.jpg"):
    path = tmp_path / name
    path.write_bytes(b"fake image bytes")
    return FileStorage(stream=open(path, "rb"), filename=name, content_type="image/jpeg")


def test_duplicate_checkin_prevented(app, db_session, exam, student, tmp_path):
    ml = FakeMLService(should_match=True)
    checkin_service.process_checkin(
        exam=exam,
        student=student,
        seating_plan=None,
        seat_assignment=None,
        entered_seat_code="A1",
        photo=make_file(tmp_path, "first.jpg"),
        upload_folder=Path(tmp_path),
        ml_client=ml,
    )
    with pytest.raises(ValueError):
        checkin_service.process_checkin(
            exam=exam,
            student=student,
            seating_plan=None,
            seat_assignment=None,
            entered_seat_code="A1",
            photo=make_file(tmp_path, "second.jpg"),
            upload_folder=Path(tmp_path),
            ml_client=ml,
        )


def test_ml_wrapper_match_and_seat_ok(app, db_session, exam, student, tmp_path):
    plan = SeatingPlan(exam_id=exam.id, name="Plan")
    db_session.add(plan)
    db_session.flush()
    seat = Seat(seating_plan_id=plan.id, seat_code="A1", row_number=1, col_number=1)
    db_session.add(seat)
    db_session.flush()
    assignment = SeatAssignment(
        exam_id=exam.id, seating_plan_id=plan.id, student_id=student.id, seat_code="A1"
    )
    db_session.add(assignment)
    db_session.commit()

    ml = FakeMLService(should_match=True, score=0.9)
    checkin = checkin_service.process_checkin(
        exam=exam,
        student=student,
        seating_plan=plan,
        seat_assignment=assignment,
        entered_seat_code="A1",
        photo=make_file(tmp_path),
        upload_folder=Path(tmp_path),
        ml_client=ml,
    )

    assert checkin.is_face_match is True
    assert checkin.is_seat_ok is True
    assert checkin.decision_status == "approved"


def test_ml_wrapper_no_match_or_wrong_seat(app, db_session, exam, student, tmp_path):
    plan = SeatingPlan(exam_id=exam.id, name="Plan")
    db_session.add(plan)
    db_session.flush()
    seat = Seat(seating_plan_id=plan.id, seat_code="A1", row_number=1, col_number=1)
    db_session.add(seat)
    db_session.flush()
    assignment = SeatAssignment(
        exam_id=exam.id, seating_plan_id=plan.id, student_id=student.id, seat_code="A1"
    )
    db_session.add(assignment)
    db_session.commit()

    ml = FakeMLService(should_match=False, score=0.2, reason="no_face_detected")
    checkin = checkin_service.process_checkin(
        exam=exam,
        student=student,
        seating_plan=plan,
        seat_assignment=assignment,
        entered_seat_code="B2",
        photo=make_file(tmp_path, "bad.jpg"),
        upload_folder=Path(tmp_path),
        ml_client=ml,
    )

    assert checkin.is_face_match is False
    assert checkin.is_seat_ok is False
    assert checkin.decision_status == "pending"
