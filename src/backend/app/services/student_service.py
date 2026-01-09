import csv
import io
from typing import List, Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from ..extensions import db
from ..models import Exam, ExamStudent, Student


def student_to_dict(student: Student) -> dict:
    return student.to_dict()


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
    for idx, row in enumerate(reader, start=2):  # start=2 to account for header row being 1
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

    # Check existing roster duplicates
    roster_dups = (
        db.session.query(Student.student_number)
        .join(ExamStudent, ExamStudent.student_id == Student.id)
        .filter(ExamStudent.exam_id == exam.id, Student.student_number.in_(seen_numbers))
        .all()
    )
    if roster_dups:
        for (student_number,) in roster_dups:
            errors.append(
                {
                    "field": "student_no",
                    "message": f"Student {student_number} already in roster",
                }
            )
        return [], errors

    # Fetch existing students to avoid duplicate creation
    existing_students = Student.query.filter(Student.student_number.in_(seen_numbers)).all()
    existing_map = {s.student_number: s for s in existing_students}

    created_records: List[ExamStudent] = []
    for row in rows:
        student = existing_map.get(row["student_no"])
        if not student:
            student = Student(student_number=row["student_no"], full_name=row["full_name"])
            db.session.add(student)
            db.session.flush()  # get id
            existing_map[row["student_no"]] = student

        exam_student = ExamStudent(exam_id=exam.id, student_id=student.id, status="enrolled")
        db.session.add(exam_student)
        created_records.append(exam_student)

    _commit()
    return created_records, []


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
