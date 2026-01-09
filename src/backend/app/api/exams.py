from http import HTTPStatus

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..common.decorators import require_roles
from ..schemas.exam import validate_exam_payload, validate_room_payload
from ..services import exam_service, student_service

admin_exams_bp = Blueprint("admin_exams", __name__, url_prefix="/api/admin/exams")
proctor_exams_bp = Blueprint("proctor_exams", __name__, url_prefix="/api/proctor/exams")
admin_rooms_bp = Blueprint("admin_rooms", __name__, url_prefix="/api/admin/rooms")


# Admin Exams CRUD
@admin_exams_bp.route("", methods=["GET"])
@require_roles("admin")
def admin_list_exams():
    exams = exam_service.list_exams()
    return jsonify({"items": [exam_service.exam_to_dict(e) for e in exams]})


@admin_exams_bp.route("", methods=["POST"])
@require_roles("admin")
def admin_create_exam():
    payload = request.get_json(silent=True) or {}
    validated, errors = validate_exam_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        exam = exam_service.create_exam(validated)
    except IntegrityError:
        return jsonify({"message": "Exam conflict or invalid references."}), HTTPStatus.BAD_REQUEST
    return jsonify(exam_service.exam_to_dict(exam)), HTTPStatus.CREATED


@admin_exams_bp.route("/<int:exam_id>", methods=["GET"])
@require_roles("admin")
def admin_get_exam(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    return jsonify(exam_service.exam_to_dict(exam))


@admin_exams_bp.route("/<int:exam_id>", methods=["PUT"])
@require_roles("admin")
def admin_update_exam(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    payload = request.get_json(silent=True) or {}
    validated, errors = validate_exam_payload(payload, partial=True)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        exam = exam_service.update_exam(exam, validated)
    except IntegrityError:
        return jsonify({"message": "Update failed due to constraint violation."}), HTTPStatus.BAD_REQUEST
    return jsonify(exam_service.exam_to_dict(exam))


@admin_exams_bp.route("/<int:exam_id>", methods=["DELETE"])
@require_roles("admin")
def admin_delete_exam(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    exam_service.delete_exam(exam)
    return "", HTTPStatus.NO_CONTENT


@admin_exams_bp.route("/<int:exam_id>/roster", methods=["GET"])
@require_roles("admin")
def admin_get_roster(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    roster = student_service.list_exam_roster(exam.id)
    return jsonify({"items": [es.to_dict() for es in roster]})


@admin_exams_bp.route("/<int:exam_id>/roster/import-csv", methods=["POST"])
@require_roles("admin")
def admin_import_roster(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND

    file_storage = request.files.get("file") or request.files.get("csv")
    created, errors = student_service.import_roster_from_csv(exam, file_storage)
    if errors:
        return jsonify({"errors": errors, "message": "Import failed"}), HTTPStatus.BAD_REQUEST
    return (
        jsonify(
            {
                "imported": len(created),
                "items": [es.to_dict() for es in created],
            }
        ),
        HTTPStatus.CREATED,
    )


# Admin Rooms CRUD
@admin_rooms_bp.route("", methods=["GET"])
@require_roles("admin")
def admin_list_rooms():
    rooms = exam_service.list_rooms()
    return jsonify({"items": [exam_service.room_to_dict(r) for r in rooms]})


@admin_rooms_bp.route("", methods=["POST"])
@require_roles("admin")
def admin_create_room():
    payload = request.get_json(silent=True) or {}
    validated, errors = validate_room_payload(payload)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        room = exam_service.create_room(validated)
    except IntegrityError:
        return jsonify({"message": "Room conflict or invalid data."}), HTTPStatus.BAD_REQUEST
    return jsonify(exam_service.room_to_dict(room)), HTTPStatus.CREATED


@admin_rooms_bp.route("/<int:room_id>", methods=["GET"])
@require_roles("admin")
def admin_get_room(room_id: int):
    room = exam_service.get_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), HTTPStatus.NOT_FOUND
    return jsonify(exam_service.room_to_dict(room))


@admin_rooms_bp.route("/<int:room_id>", methods=["PUT"])
@require_roles("admin")
def admin_update_room(room_id: int):
    room = exam_service.get_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), HTTPStatus.NOT_FOUND
    payload = request.get_json(silent=True) or {}
    validated, errors = validate_room_payload(payload, partial=True)
    if errors:
        return jsonify({"errors": errors}), HTTPStatus.BAD_REQUEST
    try:
        room = exam_service.update_room(room, validated)
    except IntegrityError:
        return jsonify({"message": "Update failed due to constraint violation."}), HTTPStatus.BAD_REQUEST
    return jsonify(exam_service.room_to_dict(room))


@admin_rooms_bp.route("/<int:room_id>", methods=["DELETE"])
@require_roles("admin")
def admin_delete_room(room_id: int):
    room = exam_service.get_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), HTTPStatus.NOT_FOUND
    exam_service.delete_room(room)
    return "", HTTPStatus.NO_CONTENT


# Proctor (read-only)
@proctor_exams_bp.route("", methods=["GET"])
@require_roles("proctor", "admin")
def proctor_list_exams():
    exams = exam_service.list_exams()
    return jsonify({"items": [exam_service.exam_to_dict(e) for e in exams]})


@proctor_exams_bp.route("/<int:exam_id>", methods=["GET"])
@require_roles("proctor", "admin")
def proctor_get_exam(exam_id: int):
    exam = exam_service.get_exam(exam_id)
    if not exam:
        return jsonify({"message": "Exam not found."}), HTTPStatus.NOT_FOUND
    return jsonify(exam_service.exam_to_dict(exam))
