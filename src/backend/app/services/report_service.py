from typing import Dict, List, Optional

from sqlalchemy import and_, func

from ..extensions import db
from ..models import Checkin, Violation


def get_summary(exam_id: Optional[int] = None) -> Dict[str, int]:
    query = Checkin.query
    if exam_id:
        query = query.filter(Checkin.exam_id == exam_id)

    total_checkins = query.count()
    face_mismatches = query.filter(Checkin.is_face_match.is_(False)).count()
    seat_mismatches = query.filter(Checkin.is_seat_ok.is_(False)).count()

    violations_query = Violation.query
    if exam_id:
        violations_query = violations_query.filter(Violation.exam_id == exam_id)
    violations_count = violations_query.count()

    return {
        "total_checkins": total_checkins,
        "face_mismatches": face_mismatches,
        "seat_mismatches": seat_mismatches,
        "violations_count": violations_count,
    }


def list_checkins(
    exam_id: Optional[int] = None,
    face_match: Optional[bool] = None,
    seat_ok: Optional[bool] = None,
) -> List[Checkin]:
    query = Checkin.query
    if exam_id:
        query = query.filter(Checkin.exam_id == exam_id)
    if face_match is not None:
        query = query.filter(Checkin.is_face_match.is_(face_match))
    if seat_ok is not None:
        query = query.filter(Checkin.is_seat_ok.is_(seat_ok))
    return query.order_by(Checkin.checked_in_at.desc()).all()


def list_violations(exam_id: Optional[int] = None) -> List[Violation]:
    query = Violation.query
    if exam_id:
        query = query.filter(Violation.exam_id == exam_id)
    return query.order_by(Violation.created_at.desc()).all()
