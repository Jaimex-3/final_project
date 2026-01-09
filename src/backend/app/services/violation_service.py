from pathlib import Path
from typing import List, Optional

from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Checkin, Exam, Student, Violation


def get_violation(violation_id: int) -> Optional[Violation]:
    return Violation.query.get(violation_id)


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


def update_violation(
    violation: Violation,
    *,
    reason: Optional[str] = None,
    notes: Optional[str] = None,
    notes_provided: bool = False,
    checkin: Optional[Checkin] = None,
    set_checkin: bool = False,
    evidence_image=None,
    upload_folder: Optional[Path] = None,
) -> Violation:
    if reason is not None:
        violation.reason = reason

    if notes_provided:
        violation.notes = notes

    if set_checkin:
        violation.checkin_id = checkin.id if checkin else None

    if evidence_image and upload_folder:
        upload_folder = Path(upload_folder)
        upload_folder.mkdir(parents=True, exist_ok=True)
        safe_name = Path(evidence_image.filename).name
        filename = f"violation_exam{violation.exam_id}_student{violation.student_id}_{safe_name}"
        evidence_path = upload_folder / filename
        # Replace existing evidence if present
        if violation.evidence_image_path:
            old_path = Path(violation.evidence_image_path)
            try:
                if old_path.exists():
                    old_path.unlink()
            except OSError:
                pass
        evidence_image.save(evidence_path)
        violation.evidence_image_path = str(evidence_path)

    _commit()
    return violation


def delete_violation(violation: Violation) -> None:
    if violation.evidence_image_path:
        try:
            path = Path(violation.evidence_image_path)
            if path.exists():
                path.unlink()
        except OSError:
            pass
    db.session.delete(violation)
    _commit()


def _commit() -> None:
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise
