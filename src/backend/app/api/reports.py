from http import HTTPStatus

from flask import Blueprint, jsonify, request

from ..common.decorators import require_roles
from ..services import report_service

admin_reports_bp = Blueprint("admin_reports", __name__, url_prefix="/api/admin/reports")


@admin_reports_bp.route("/summary", methods=["GET"])
@require_roles("admin")
def summary():
    exam_id = request.args.get("exam_id", type=int)
    data = report_service.get_summary(exam_id=exam_id)
    return jsonify(data)


@admin_reports_bp.route("/checkins", methods=["GET"])
@require_roles("admin")
def report_checkins():
    exam_id = request.args.get("exam_id", type=int)
    face_match = request.args.get("face_match")
    seat_ok = request.args.get("seat_ok")

    def to_bool(value):
        if value is None:
            return None
        return str(value).lower() in ("true", "1", "yes")

    face_match_bool = to_bool(face_match) if face_match is not None else None
    seat_ok_bool = to_bool(seat_ok) if seat_ok is not None else None

    checkins = report_service.list_checkins(
        exam_id=exam_id,
        face_match=face_match_bool,
        seat_ok=seat_ok_bool,
    )
    return jsonify({"items": [c.to_dict() for c in checkins]})


@admin_reports_bp.route("/violations", methods=["GET"])
@require_roles("admin")
def report_violations():
    exam_id = request.args.get("exam_id", type=int)
    violations = report_service.list_violations(exam_id=exam_id)
    return jsonify({"items": [v.to_dict() for v in violations]})
