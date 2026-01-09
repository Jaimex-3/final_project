from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return (
            jsonify({"message": "Email and password are required."}),
            HTTPStatus.BAD_REQUEST,
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.is_active or not user.check_password(password):
        return jsonify({"message": "Invalid credentials."}), HTTPStatus.UNAUTHORIZED

    claims = {
        "role": user.role.name if user.role else None,
        "email": user.email,
    }
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)

    return jsonify({"access_token": access_token, "user": user.to_dict()}), HTTPStatus.OK


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), HTTPStatus.NOT_FOUND

    return jsonify({"user": user.to_dict(), "claims": get_jwt()}), HTTPStatus.OK
