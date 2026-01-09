from ..extensions import db
from .base import BaseModel


class Student(BaseModel):
    __tablename__ = "students"

    student_number = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)

    exam_students = db.relationship("ExamStudent", back_populates="student", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_number": self.student_number,
            "full_name": self.full_name,
            "email": self.email,
        }


class ExamStudent(db.Model):
    __tablename__ = "exam_students"

    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="RESTRICT"), primary_key=True)
    status = db.Column(db.String(20), default="enrolled", nullable=False)

    exam = db.relationship("Exam", back_populates="exam_students", lazy="joined")
    student = db.relationship("Student", back_populates="exam_students", lazy="joined")

    def to_dict(self) -> dict:
        return {
            "exam_id": self.exam_id,
            "student_id": self.student_id,
            "status": self.status,
            "student": self.student.to_dict() if self.student else None,
        }
