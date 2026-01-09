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


@proctor_violations_bp.route("/violations/<int:violation_id>", methods=["PUT"])
@require_roles("proctor", "admin")
def update_violation(violation_id: int):
    violation = violation_service.get_violation(violation_id)
    if not violation:
        return jsonify({"message": "Violation not found."}), HTTPStatus.NOT_FOUND

    data = request.form
    evidence = request.files.get("evidence") or request.files.get("evidence_image")

    updates = {}
    errors = {}

    if "reason" in data:
        reason = (data.get("reason") or "").strip()
        if not reason:
            errors["reason"] = "Reason cannot be empty."
        else:
            updates["reason"] = reason

    if "notes" in data:
        notes_val = (data.get("notes") or "").strip()
        updates["notes"] = notes_val or None
        updates["notes_provided"] = True

    checkin_obj = None
    if "checkin_id" in data:
        checkin_raw = data.get("checkin_id")
        if checkin_raw:
            try:
                checkin_obj = Checkin.query.get(int(checkin_raw))
            except (TypeError, ValueError):
                errors["checkin_id"] = "checkin_id must be an integer."
            else:
                if not checkin_obj:
                    errors["checkin_id"] = "Checkin not found."
        updates["set_checkin"] = True
        updates["checkin"] = checkin_obj

    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST

    if not updates and not evidence:
        return jsonify({"message": "No fields to update."}), HTTPStatus.BAD_REQUEST

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"]).resolve() / "evidence"
    try:
        violation = violation_service.update_violation(
            violation,
            reason=updates.get("reason"),
            notes=updates.get("notes"),
            notes_provided=updates.get("notes_provided", False),
            checkin=updates.get("checkin"),
            set_checkin=updates.get("set_checkin", False),
            evidence_image=evidence,
            upload_folder=upload_folder,
        )
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Constraint error updating violation."}), HTTPStatus.BAD_REQUEST

    return jsonify(violation.to_dict())


@proctor_violations_bp.route("/violations/<int:violation_id>", methods=["DELETE"])
@require_roles("proctor", "admin")
def delete_violation(violation_id: int):
    violation = violation_service.get_violation(violation_id)
    if not violation:
        return jsonify({"message": "Violation not found."}), HTTPStatus.NOT_FOUND
    violation_service.delete_violation(violation)
    return "", HTTPStatus.NO_CONTENT
