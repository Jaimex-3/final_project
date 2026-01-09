from ..extensions import db
from .base import BaseModel


class Checkin(BaseModel):
    __tablename__ = "checkins"

    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    seating_plan_id = db.Column(db.Integer, db.ForeignKey("seating_plans.id", ondelete="SET NULL"))
    seat_assignment_id = db.Column(db.Integer, db.ForeignKey("seat_assignments.id", ondelete="SET NULL"))
    seat_code_entered = db.Column(db.String(50))
    is_face_match = db.Column(db.Boolean, default=False, nullable=False)
    is_seat_ok = db.Column(db.Boolean, default=False, nullable=False)
    decision_status = db.Column(db.String(20), default="pending", nullable=False)
    photo_path = db.Column(db.String(255))
    checked_in_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    notes = db.Column(db.Text)

    exam = db.relationship("Exam", lazy="joined")
    student = db.relationship("Student", lazy="joined")

    __table_args__ = (
        db.UniqueConstraint("exam_id", "student_id", name="uq_checkins_exam_student"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "exam_id": self.exam_id,
            "student_id": self.student_id,
            "seating_plan_id": self.seating_plan_id,
            "seat_assignment_id": self.seat_assignment_id,
            "seat_code_entered": self.seat_code_entered,
            "is_face_match": self.is_face_match,
            "is_seat_ok": self.is_seat_ok,
            "decision_status": self.decision_status,
            "photo_path": self.photo_path,
            "checked_in_at": self.checked_in_at.isoformat() if self.checked_in_at else None,
            "notes": self.notes,
            "exam": {"id": self.exam.id, "title": self.exam.title, "code": self.exam.code} if self.exam else None,
            "student": {
                "id": self.student.id,
                "full_name": self.student.full_name,
                "student_number": self.student.student_number,
            }
            if self.student
            else None,
        }
