from http import HTTPStatus

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..common.decorators import require_roles
from ..schemas.seating import (
    validate_seat_assignments_payload,
    validate_seating_plan_payload,
)
from ..services import exam_service, seating_service

seating_bp = Blueprint("seating", __name__)


@seating_bp.route("/api/admin/exams/<int:exam_id>/seating-plan", methods=["POST"])
@require_roles("admin")
def create_seating_plan(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND

    payload = request.get_json(silent=True) or {}
    validated, errors = validate_seating_plan_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        plan = seating_service.create_seating_plan(exam, validated)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), HTTPStatus.BAD_REQUEST
    except IntegrityError:
        return jsonify({"message": "Constraint error creating seating plan."}), HTTPStatus.BAD_REQUEST

    return jsonify(seating_service.seating_plan_to_dict(plan)), HTTPStatus.CREATED


@seating_bp.route("/api/admin/exams/<int:exam_id>/seating-plan", methods=["GET"])
@require_roles("admin")
def get_seating_plan(exam_id: int):
    plan = seating_service.get_seating_plan(exam_id)
    if not plan:
        return jsonify({"message": "Seating plan not found."}), HTTPStatus.NOT_FOUND
    return jsonify(seating_service.seating_plan_to_dict(plan))


@seating_bp.route("/api/admin/exams/<int:exam_id>/seat-assignments", methods=["POST"])
@require_roles("admin")
def assign_seats(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND

    plan = seating_service.get_seating_plan(exam_id)
    if not plan:
        return jsonify({"message": "Seating plan not found."}), HTTPStatus.BAD_REQUEST

    payload = request.get_json(silent=True) or {}
    assignments, errors = validate_seat_assignments_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        saved = seating_service.assign_seats(exam, plan, assignments)
    except ValueError as exc:
        return jsonify({"errors": getattr(exc, "args", [[]])[0]}), HTTPStatus.BAD_REQUEST
    except IntegrityError:
        return jsonify({"message": "Constraint error assigning seats."}), HTTPStatus.BAD_REQUEST

    return jsonify({"items": [sa.to_dict() for sa in saved]}), HTTPStatus.CREATED


@seating_bp.route("/api/admin/exams/<int:exam_id>/seat-assignments", methods=["GET"])
@require_roles("admin")
def list_seat_assignments(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    assignments = seating_service.list_seat_assignments(exam_id)
    return jsonify({"items": [sa.to_dict() for sa in assignments]})
