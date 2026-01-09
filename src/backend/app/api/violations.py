from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..common.decorators import require_roles
from ..extensions import db
from ..models import Checkin, Exam, Student
from ..services import violation_service

proctor_violations_bp = Blueprint("proctor_violations", __name__, url_prefix="/api/proctor")
admin_violations_bp = Blueprint("admin_violations", __name__, url_prefix="/api/admin")


@proctor_violations_bp.route("/violations", methods=["POST"])
@require_roles("proctor", "admin")
def create_violation():
    exam_id = request.form.get("exam_id")
    student_id = request.form.get("student_id")
    reason = (request.form.get("reason") or "").strip()
    notes = (request.form.get("notes") or "").strip() or None
    checkin_id = request.form.get("checkin_id")
    evidence = request.files.get("evidence") or request.files.get("evidence_image")

    if not exam_id or not student_id or not reason:
        return jsonify({"message": "exam_id, student_id, and reason are required."}), HTTPStatus.BAD_REQUEST

    try:
        exam_id_int = int(exam_id)
        student_id_int = int(student_id)
        checkin_id_int = int(checkin_id) if checkin_id else None
    except (ValueError, TypeError):
        return jsonify({"message": "exam_id, student_id (and checkin_id if provided) must be integers."}), HTTPStatus.BAD_REQUEST

    exam = Exam.query.get(exam_id_int)
    student = Student.query.get(student_id_int)
    if not exam or not student:
        return jsonify({"message": "Exam or student not found."}), HTTPStatus.NOT_FOUND

    checkin = None
    if checkin_id_int:
        checkin = Checkin.query.get(checkin_id_int)
        if not checkin:
            return jsonify({"message": "Checkin not found."}), HTTPStatus.NOT_FOUND

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"]).resolve() / "evidence"

    try:
        violation = violation_service.create_violation(
            exam=exam,
            student=student,
            reason=reason,
            notes=notes,
            evidence_image=evidence,
            upload_folder=upload_folder,
            checkin=checkin,
        )
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Constraint error creating violation."}), HTTPStatus.BAD_REQUEST

    return jsonify(violation.to_dict()), HTTPStatus.CREATED


@proctor_violations_bp.route("/exams/<int:exam_id>/violations", methods=["GET"])
@require_roles("proctor", "admin")
def list_exam_violations(exam_id: int):
    violations = violation_service.list_violations_by_exam(exam_id)
    return jsonify({"items": [v.to_dict() for v in violations]})


@admin_violations_bp.route("/violations", methods=["GET"])
@require_roles("admin")
def list_violations():
    exam_id = request.args.get("exam_id", type=int)
    violations = violation_service.list_violations_filtered(exam_id=exam_id)
    return jsonify({"items": [v.to_dict() for v in violations]})
