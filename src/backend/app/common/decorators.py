from functools import wraps
from http import HTTPStatus

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def require_roles(*allowed_roles):
    """
    Protect endpoint with role-based access.
    Usage: @require_roles("admin") or @require_roles("proctor", "admin")
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if not role or role not in allowed_roles:
                return (
                    jsonify({"message": "Forbidden: insufficient role."}),
                    HTTPStatus.FORBIDDEN,
                )
            return fn(*args, **kwargs)

        return wrapper

    return decorator
