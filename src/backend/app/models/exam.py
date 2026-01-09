from ..extensions import db
from .base import BaseModel


class Exam(BaseModel):
    __tablename__ = "exams"

    code = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    start_at = db.Column(db.DateTime(timezone=False), nullable=False)
    end_at = db.Column(db.DateTime(timezone=False), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.id", ondelete="SET NULL"))

    room = db.relationship("Room", back_populates="exams", lazy="joined")
    exam_students = db.relationship("ExamStudent", back_populates="exam", lazy="dynamic", cascade="all, delete-orphan")
