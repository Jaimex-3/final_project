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
    return jsonify(student_service.student_to_dict(student)), HTTPStatus.CREATED


@admin_students_bp.route("", methods=["GET"])
@require_roles("admin")
def list_students():
    search = request.args.get("search")
    students = student_service.list_students(search)
    return jsonify({"items": [student_service.student_to_dict(s) for s in students]})
