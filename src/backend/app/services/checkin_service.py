from pathlib import Path
from typing import Dict, List, Optional

from werkzeug.datastructures import FileStorage

from ..extensions import db
from ..models import Checkin, Exam, SeatAssignment, SeatingPlan, Student
from ..services import ml_service, seating_service


def process_checkin(
    exam: Exam,
    student: Student,
    seating_plan: Optional[SeatingPlan],
    seat_assignment: Optional[SeatAssignment],
    entered_seat_code: str,
    photo: FileStorage,
    upload_folder: Path,
    ml_client: ml_service.MLService,
) -> Checkin:
    # Prevent duplicate check-in
    existing = Checkin.query.filter_by(exam_id=exam.id, student_id=student.id).first()
    if existing:
        raise ValueError("Student already checked in for this exam.")

    entered_seat_code_norm = (entered_seat_code or "").strip().upper()

    # Save uploaded photo
    upload_folder = Path(upload_folder)
    upload_folder.mkdir(parents=True, exist_ok=True)
    safe_name = Path(photo.filename).name
    filename = f"checkin_exam{exam.id}_student{student.id}_{safe_name}"
    photo_path = upload_folder / filename
    photo.save(photo_path)

    # Face verification
    face_result = ml_client.verify_student_face(student.id, photo_path)
    is_face_match = bool(face_result.get("match"))

    # Seating compliance
    assigned_code = seat_assignment.seat_code if seat_assignment else None
    is_seat_ok = seating_service.check_seat_compliance(assigned_code or "", entered_seat_code_norm)

    decision_status = "approved" if is_face_match and is_seat_ok else "pending"

    checkin = Checkin(
        exam_id=exam.id,
        student_id=student.id,
        seating_plan_id=seating_plan.id if seating_plan else None,
        seat_assignment_id=seat_assignment.id if seat_assignment else None,
        seat_code_entered=entered_seat_code_norm,
        is_face_match=is_face_match,
        is_seat_ok=is_seat_ok,
        decision_status=decision_status,
        photo_path=str(photo_path),
    )
    db.session.add(checkin)
    db.session.commit()
    return checkin


def list_checkins(exam_id: int) -> List[Checkin]:
    return (
        Checkin.query.filter(Checkin.exam_id == exam_id)
        .order_by(Checkin.checked_in_at.desc())
        .all()
    )
