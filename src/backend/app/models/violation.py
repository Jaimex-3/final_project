from ..extensions import db
from .base import BaseModel


class Violation(BaseModel):
    __tablename__ = "violations"

    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    checkin_id = db.Column(db.Integer, db.ForeignKey("checkins.id", ondelete="SET NULL"))
    reason = db.Column(db.String(100), nullable=False)
    notes = db.Column(db.Text)
    evidence_image_path = db.Column(db.String(255))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "exam_id": self.exam_id,
            "student_id": self.student_id,
            "checkin_id": self.checkin_id,
            "reason": self.reason,
            "notes": self.notes,
            "evidence_image_path": self.evidence_image_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
