from ..extensions import db
from .base import BaseModel


class Student(BaseModel):
    __tablename__ = "students"

    student_number = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)

    exam_students = db.relationship("ExamStudent", back_populates="student", lazy="dynamic", cascade="all, delete-orphan")
    photos = db.relationship("StudentReferencePhoto", back_populates="student", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_number": self.student_number,
            "full_name": self.full_name,
            "email": self.email,
            "photos": [p.to_dict() for p in self.photos.all()],
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


class StudentReferencePhoto(BaseModel):
    __tablename__ = "student_reference_photos"

    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    embedding_hash = db.Column(db.String(255))
    meta_data = db.Column(db.JSON)

    __table_args__ = (
        db.UniqueConstraint("student_id", "image_path", name="uq_student_image_path"),
    )

    student = db.relationship("Student", back_populates="photos")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "image_path": self.image_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
