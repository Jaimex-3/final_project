from ..extensions import db
from .base import BaseModel


class SeatingPlan(BaseModel):
    __tablename__ = "seating_plans"

    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, unique=True)
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    name = db.Column(db.String(255), nullable=False, default="Seating Plan")

    seats = db.relationship("Seat", back_populates="seating_plan", cascade="all, delete-orphan", lazy="dynamic")
    seat_assignments = db.relationship("SeatAssignment", back_populates="seating_plan", cascade="all, delete-orphan", lazy="dynamic")


class Seat(BaseModel):
    __tablename__ = "seats"

    seating_plan_id = db.Column(db.Integer, db.ForeignKey("seating_plans.id", ondelete="CASCADE"), nullable=False)
    seat_code = db.Column(db.String(50), nullable=False)
    row_number = db.Column(db.Integer)
    col_number = db.Column(db.Integer)

    __table_args__ = (
        db.UniqueConstraint("seating_plan_id", "seat_code", name="uq_seat_code_per_plan"),
        db.UniqueConstraint("seating_plan_id", "row_number", "col_number", name="uq_seat_position_per_plan"),
    )

    seating_plan = db.relationship("SeatingPlan", back_populates="seats", lazy="joined")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "seat_code": self.seat_code,
            "row_number": self.row_number,
            "col_number": self.col_number,
        }


class SeatAssignment(BaseModel):
    __tablename__ = "seat_assignments"

    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    seating_plan_id = db.Column(db.Integer, db.ForeignKey("seating_plans.id", ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="RESTRICT"), nullable=False)
    seat_code = db.Column(db.String(50), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))

    __table_args__ = (
        db.UniqueConstraint("exam_id", "student_id", name="uq_assignment_exam_student"),
        db.UniqueConstraint("exam_id", "seat_code", name="uq_assignment_exam_seat"),
    )

    seating_plan = db.relationship("SeatingPlan", back_populates="seat_assignments", lazy="joined")
    student = db.relationship("Student", lazy="joined")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "exam_id": self.exam_id,
            "seating_plan_id": self.seating_plan_id,
            "student_id": self.student_id,
            "seat_code": self.seat_code,
            "student": self.student.to_dict() if self.student else None,
        }
