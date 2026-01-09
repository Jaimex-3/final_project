import re
from typing import Any, Dict, Tuple


def validate_student_payload(data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, str]]:
    errors: Dict[str, str] = {}
    validated: Dict[str, Any] = {}

    student_no = (data.get("student_no") or "").strip()
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip()

    if not student_no:
        errors["student_no"] = "student_no is required."
    else:
        validated["student_number"] = student_no

    if not full_name:
        errors["full_name"] = "full_name is required."
    else:
        validated["full_name"] = full_name

    if email:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors["email"] = "Invalid email format."
        else:
            validated["email"] = email

    return validated, errors
