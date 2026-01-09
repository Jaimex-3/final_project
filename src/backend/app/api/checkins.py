from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..common.decorators import require_roles
from ..extensions import db
from ..models import Exam, SeatAssignment, SeatingPlan, Student
from ..services import checkin_service, ml_service

proctor_checkins_bp = Blueprint("proctor_checkins", __name__, url_prefix="/api/proctor")


@proctor_checkins_bp.route("/checkins", methods=["POST"])
@require_roles("proctor", "admin")
def create_checkin():
    exam_id = request.form.get("exam_id")
    student_id = request.form.get("student_id")
    entered_seat_code = request.form.get("entered_seat_code") or ""
    photo = request.files.get("photo")

    if not exam_id or not student_id or not photo:
        return (
            jsonify({"message": "exam_id, student_id and photo are required."}),
            HTTPStatus.BAD_REQUEST,
        )

    try:
        exam_id_int = int(exam_id)
        student_id_int = int(student_id)
    except (ValueError, TypeError):
        return jsonify({"message": "exam_id and student_id must be integers."}), HTTPStatus.BAD_REQUEST

    exam = Exam.query.get(exam_id_int)
    student = Student.query.get(student_id_int)
    if not exam or not student:
        return jsonify({"message": "Exam or student not found."}), HTTPStatus.NOT_FOUND

    seating_plan = SeatingPlan.query.filter_by(exam_id=exam.id).first()
    seat_assignment = None
    if seating_plan:
        seat_assignment = SeatAssignment.query.filter_by(exam_id=exam.id, student_id=student.id).first()

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"]).resolve()
    ml_client = getattr(current_app, "ml_client", None) or ml_service.FakeMLService()

    try:
        checkin = checkin_service.process_checkin(
            exam=exam,
            student=student,
            seating_plan=seating_plan,
            seat_assignment=seat_assignment,
            entered_seat_code=entered_seat_code,
            photo=photo,
            upload_folder=upload_folder,
            ml_client=ml_client,
        )
    except ValueError as exc:
        return jsonify({"message": str(exc)}), HTTPStatus.BAD_REQUEST
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Constraint error creating check-in."}), HTTPStatus.BAD_REQUEST

    return jsonify(checkin.to_dict()), HTTPStatus.CREATED


@proctor_checkins_bp.route("/exams/<int:exam_id>/checkins", methods=["GET"])
@require_roles("proctor", "admin")
def list_checkins(exam_id: int):
    checkins = checkin_service.list_checkins(exam_id)
    return jsonify({"items": [c.to_dict() for c in checkins]})
