from http import HTTPStatus

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..common.decorators import require_roles
from ..schemas.student import validate_student_payload
from ..services import student_service

admin_students_bp = Blueprint("admin_students", __name__, url_prefix="/api/admin/students")


@admin_students_bp.route("", methods=["POST"])
@require_roles("admin")
def create_student():
    payload = request.get_json(silent=True) or {}
    validated, errors = validate_student_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        student = student_service.create_student(validated)
    except IntegrityError:
        return jsonify({"message": "student_no or email already exists."}), HTTPStatus.BAD_REQUEST
    return jsonify(student.to_dict()), HTTPStatus.CREATED


@admin_students_bp.route("", methods=["GET"])
@require_roles("admin")
def list_students():
    search = request.args.get("search")
    students = student_service.list_students(search)
    return jsonify({"items": [s.to_dict() for s in students]})


@admin_students_bp.route("/<int:student_id>", methods=["GET"])
@require_roles("admin")
def get_student(student_id):
    student = student_service.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found."}), HTTPStatus.NOT_FOUND
    return jsonify(student.to_dict())


@admin_students_bp.route("/<int:student_id>", methods=["PUT"])
@require_roles("admin")
def update_student(student_id):
    student = student_service.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found."}), HTTPStatus.NOT_FOUND

    payload = request.get_json(silent=True) or {}
    validated, errors = validate_student_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST

    try:
        student_service.update_student(student, validated)
    except IntegrityError:
        return jsonify({"message": "student_no or email already exists."}), HTTPStatus.BAD_REQUEST

    return jsonify(student.to_dict())


@admin_students_bp.route("/<int:student_id>", methods=["DELETE"])
@require_roles("admin")
def delete_student(student_id):
    student = student_service.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found."}), HTTPStatus.NOT_FOUND

    try:
        student_service.delete_student(student)
    except Exception:
        return (
            jsonify({"message": "Cannot delete student as they have active records (exams, checkins, etc.)."}),
            HTTPStatus.BAD_REQUEST,
        )

    return "", HTTPStatus.NO_CONTENT


@admin_students_bp.route("/<int:student_id>/photo", methods=["POST"])
@require_roles("admin")
def upload_student_photo(student_id):
    student = student_service.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found."}), HTTPStatus.NOT_FOUND

    file = request.files.get("photo")
    if not file:
        return jsonify({"message": "No photo file provided."}), HTTPStatus.BAD_REQUEST

    try:
        path = student_service.add_student_photo(student, file)
        return jsonify({"message": "Photo uploaded.", "path": path}), HTTPStatus.OK
    except Exception as e:
        return jsonify({"message": f"Upload failed: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR
