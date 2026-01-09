import csv
import io
import os
import uuid
from typing import List, Optional, Tuple

from flask import current_app
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from ..extensions import db
from ..models import Exam, ExamStudent, Student, StudentReferencePhoto


def list_students(search: Optional[str] = None) -> List[Student]:
    query = Student.query
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.full_name.ilike(like),
                Student.student_number.ilike(like),
            )
        )
    return query.order_by(Student.student_number.asc()).all()


def create_student(validated: dict) -> Student:
    student = Student(
        student_number=validated["student_number"],
        full_name=validated["full_name"],
        email=validated.get("email"),
    )
    db.session.add(student)
    _commit()
    return student


def update_student(student: Student, validated: dict) -> Student:
    student.student_number = validated["student_number"]
    student.full_name = validated["full_name"]
    student.email = validated.get("email")
    _commit()
    return student


def delete_student(student: Student) -> None:
    db.session.delete(student)
    _commit()


def get_student_by_id(student_id: int) -> Optional[Student]:
    return Student.query.get(student_id)


def import_roster_from_csv(exam: Exam, file_storage) -> Tuple[List[ExamStudent], List[dict]]:
    """
    Returns (exam_students, errors)
    """
    errors: List[dict] = []
    if not file_storage:
        return [], [{"message": "No file uploaded."}]

    content = file_storage.read().decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    required_columns = {"student_no", "full_name"}
    if not reader.fieldnames or not required_columns.issubset(set(fn.strip().lower() for fn in reader.fieldnames)):
        return [], [{"message": "CSV must include columns: student_no, full_name"}]

    seen_numbers = set()
    rows = []
    for idx, row in enumerate(reader, start=2):
        normalized = {k.strip().lower(): (v or "").strip() for k, v in row.items()}
        student_no = normalized.get("student_no", "")
        full_name = normalized.get("full_name", "")
        if not student_no:
            errors.append({"row": idx, "field": "student_no", "message": "student_no is required"})
            continue
        if student_no in seen_numbers:
            errors.append({"row": idx, "field": "student_no", "message": "Duplicate student_no in file"})
            continue
        seen_numbers.add(student_no)
        if not full_name:
            errors.append({"row": idx, "field": "full_name", "message": "full_name is required"})
            continue
        rows.append({"student_no": student_no, "full_name": full_name})

    if errors:
        return [], errors

    existing_students = Student.query.filter(Student.student_number.in_(seen_numbers)).all()
    existing_map = {s.student_number: s for s in existing_students}

    created_records: List[ExamStudent] = []
    for row in rows:
        student = existing_map.get(row["student_no"])
        if not student:
            student = Student(student_number=row["student_no"], full_name=row["full_name"])
            db.session.add(student)
            db.session.flush()
            existing_map[row["student_no"]] = student

        exam_student = ExamStudent(exam_id=exam.id, student_id=student.id, status="enrolled")
        db.session.add(exam_student)
        created_records.append(exam_student)

    _commit()
    return created_records, []


def add_student_photo(student: Student, file_storage) -> str:
    filename = secure_filename(f"student_{student.id}_{file_storage.filename}")
    
    if os.path.exists(os.path.join(current_app.config["UPLOAD_FOLDER"], "reference", filename)):
        filename = f"{uuid.uuid4().hex[:8]}_{filename}"

    relative_path = os.path.join("uploads", "reference", filename)
    absolute_path = os.path.join(current_app.config["UPLOAD_FOLDER"], "reference", filename)
    
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    file_storage.save(absolute_path)
    
    ref_photo = StudentReferencePhoto(student_id=student.id, image_path=relative_path)
    db.session.add(ref_photo)
    _commit()
    return relative_path


def add_student_to_exam(exam_id: int, student_id: int) -> ExamStudent:
    exam_student = ExamStudent(exam_id=exam_id, student_id=student_id, status="enrolled")
    db.session.add(exam_student)
    _commit()
    return exam_student


def remove_student_from_exam(exam_id: int, student_id: int) -> None:
    exam_student = ExamStudent.query.filter_by(exam_id=exam_id, student_id=student_id).first()
    if exam_student:
        db.session.delete(exam_student)
        _commit()


def list_exam_roster(exam_id: int) -> List[ExamStudent]:
    return (
        ExamStudent.query.options(joinedload(ExamStudent.student))
        .filter(ExamStudent.exam_id == exam_id)
        .order_by(ExamStudent.student_id.asc())
        .all()
    )


def _commit() -> None:
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise
