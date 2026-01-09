from pathlib import Path
from typing import List, Optional

from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Checkin, Exam, Student, Violation


def create_violation(
    exam: Exam,
    student: Student,
    reason: str,
    notes: Optional[str],
    evidence_image,
    upload_folder: Path,
    checkin: Optional[Checkin] = None,
) -> Violation:
    upload_folder = Path(upload_folder)
    upload_folder.mkdir(parents=True, exist_ok=True)

    evidence_path = None
    if evidence_image:
        safe_name = Path(evidence_image.filename).name
        filename = f"violation_exam{exam.id}_student{student.id}_{safe_name}"
        evidence_path = upload_folder / filename
        evidence_image.save(evidence_path)

    violation = Violation(
        exam_id=exam.id,
        student_id=student.id,
        checkin_id=checkin.id if checkin else None,
        reason=reason,
        notes=notes,
        evidence_image_path=str(evidence_path) if evidence_path else None,
    )
    db.session.add(violation)
    _commit()
    return violation


def list_violations_by_exam(exam_id: int) -> List[Violation]:
    return (
        Violation.query.filter(Violation.exam_id == exam_id)
        .order_by(Violation.created_at.desc())
        .all()
    )


def list_violations_filtered(exam_id: Optional[int] = None) -> List[Violation]:
    query = Violation.query
    if exam_id:
        query = query.filter(Violation.exam_id == exam_id)
    return query.order_by(Violation.created_at.desc()).all()


def _commit() -> None:
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise
