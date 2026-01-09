from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from ..extensions import db
from ..models import Exam, ExamStudent, Seat, SeatAssignment, SeatingPlan, Student


def check_seat_compliance(assigned_seat_code: str, entered_seat_code: str) -> bool:
    """Pure function to compare seat codes case-insensitively."""
    if assigned_seat_code is None or entered_seat_code is None:
        return False
    return assigned_seat_code.strip().upper() == entered_seat_code.strip().upper()


def create_seating_plan(exam: Exam, validated: dict) -> SeatingPlan:
    if SeatingPlan.query.filter_by(exam_id=exam.id).first():
        raise ValueError("Seating plan already exists for this exam.")

    if not exam.room_id:
        raise ValueError("Exam must have a room assigned before creating a seating plan.")

    plan = SeatingPlan(
        exam_id=exam.id,
        room_id=exam.room_id,
        name=validated.get("name") or "Seating Plan"
    )
    db.session.add(plan)
    db.session.flush()  # get plan id

    for seat in validated["seats"]:
        seat_code = seat["seat_code"].upper()
        row_number = seat.get("row_number")
        col_number = seat.get("col_number")
        db.session.add(
            Seat(
                seating_plan_id=plan.id,
                seat_code=seat_code,
                row_number=row_number,
                col_number=col_number,
            )
        )

    _commit()
    return plan


def get_seating_plan(exam_id: int) -> Optional[SeatingPlan]:
    return (
        SeatingPlan.query.filter(SeatingPlan.exam_id == exam_id)
        .first()
    )


def seating_plan_to_dict(plan: SeatingPlan) -> dict:
    return {
        "id": plan.id,
        "exam_id": plan.exam_id,
        "name": plan.name,
        "seats": [seat.to_dict() for seat in plan.seats.order_by(Seat.row_number.asc(), Seat.col_number.asc(), Seat.seat_code.asc()).all()],
        "total_seats": plan.seats.count(),
    }


def assign_seats(exam: Exam, plan: SeatingPlan, assignments: List[Dict[str, Any]]) -> List[SeatAssignment]:
    # Validate seats exist in plan
    seat_map = {s.seat_code.upper(): s for s in plan.seats.all()}
    errors = []
    for assignment in assignments:
        if assignment["seat_code"].upper() not in seat_map:
            errors.append({"seat_code": assignment["seat_code"], "message": "Seat does not exist in plan"})
    if errors:
        raise ValueError(errors)

    student_ids = [a["student_id"] for a in assignments]
    students = Student.query.filter(Student.id.in_(student_ids)).all()
    student_map = {s.id: s for s in students}

    roster_ids = {
        es.student_id
        for es in ExamStudent.query.filter(ExamStudent.exam_id == exam.id, ExamStudent.student_id.in_(student_ids))
    }

    for sid in student_ids:
        if sid not in student_map:
            errors.append({"student_id": sid, "message": "Student not found"})
        elif sid not in roster_ids:
            errors.append({"student_id": sid, "message": "Student not in exam roster"})
    if errors:
        raise ValueError(errors)

    # Detect seat conflicts with existing assignments
    existing_assignments = SeatAssignment.query.filter_by(exam_id=exam.id).all()
    seat_to_student = {a.seat_code.upper(): a.student_id for a in existing_assignments}
    student_to_assignment = {a.student_id: a for a in existing_assignments}

    for a in assignments:
        seat_code_upper = a["seat_code"].upper()
        student_id = a["student_id"]
        owner = seat_to_student.get(seat_code_upper)
        if owner and owner != student_id:
            errors.append({"seat_code": seat_code_upper, "message": "Seat already assigned to another student"})
    if errors:
        raise ValueError(errors)

    saved: List[SeatAssignment] = []
    for a in assignments:
        seat_code_upper = a["seat_code"].upper()
        student_id = a["student_id"]
        assignment = student_to_assignment.get(student_id)
        if assignment:
            assignment.seat_code = seat_code_upper
            assignment.seating_plan_id = plan.id  # Ensure updated plan
        else:
            assignment = SeatAssignment(
                exam_id=exam.id,
                seating_plan_id=plan.id,
                student_id=student_id,
                seat_code=seat_code_upper,
                assigned_by=1  # TODO: get current user id from context if possible or pass it
            )
            db.session.add(assignment)
        saved.append(assignment)

    _commit()
    return saved


def list_seat_assignments(exam_id: int) -> List[SeatAssignment]:
    return SeatAssignment.query.filter_by(exam_id=exam_id).all()


def _commit() -> None:
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise
