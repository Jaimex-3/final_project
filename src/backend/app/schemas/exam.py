from datetime import datetime, time
from typing import Any, Dict, Tuple


def _parse_date(value: str):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _parse_time(value: str):
    try:
        return datetime.strptime(value, "%H:%M").time()
    except (ValueError, TypeError):
        return None


def validate_exam_payload(data: Dict[str, Any], partial: bool = False) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """
    Validate exam payload. Returns (validated, errors).
    Required fields: title, date, start_time, end_time, room_id (unless partial).
    """
    errors: Dict[str, str] = {}
    validated: Dict[str, Any] = {}

    required_fields = ["title", "date", "start_time", "end_time", "room_id"]
    for field in required_fields:
        if not partial and not data.get(field):
            errors[field] = "This field is required."

    title = (data.get("title") or "").strip()
    if title:
        validated["title"] = title
    elif "title" in data and not title:
        errors["title"] = "Title cannot be empty."

    exam_date = None
    if "date" in data:
        exam_date = _parse_date(data.get("date"))
        if not exam_date:
            errors["date"] = "Invalid date format. Use YYYY-MM-DD."
        else:
            validated["date"] = exam_date

    start_time = None
    if "start_time" in data:
        start_time = _parse_time(data.get("start_time"))
        if not start_time:
            errors["start_time"] = "Invalid time format. Use HH:MM (24h)."
        else:
            validated["start_time"] = start_time

    end_time = None
    if "end_time" in data:
        end_time = _parse_time(data.get("end_time"))
        if not end_time:
            errors["end_time"] = "Invalid time format. Use HH:MM (24h)."
        else:
            validated["end_time"] = end_time

    any_schedule_fields = any(field in data for field in ("date", "start_time", "end_time"))
    if any_schedule_fields:
        if not (exam_date and start_time and end_time):
            errors["schedule"] = "To update schedule, provide date, start_time, and end_time."
        else:
            start_at = datetime.combine(exam_date, start_time)
            end_at = datetime.combine(exam_date, end_time)
            if end_at <= start_at:
                errors["end_time"] = "End time must be after start time."
            else:
                validated["start_at"] = start_at
                validated["end_at"] = end_at

    if "room_id" in data:
        try:
            room_id = int(data.get("room_id"))
            if room_id <= 0:
                raise ValueError
            validated["room_id"] = room_id
        except (ValueError, TypeError):
            errors["room_id"] = "room_id must be a positive integer."

    return validated, errors


def validate_room_payload(data: Dict[str, Any], partial: bool = False) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """
    Validate room payload. Fields: name (required), capacity (required), location (optional).
    """
    errors: Dict[str, str] = {}
    validated: Dict[str, Any] = {}

    if not partial and not data.get("name"):
        errors["name"] = "This field is required."
    name = (data.get("name") or "").strip()
    if name:
        validated["name"] = name
    elif "name" in data and not name:
        errors["name"] = "Name cannot be empty."

    if not partial and data.get("capacity") is None:
        errors["capacity"] = "This field is required."
    if "capacity" in data:
        try:
            capacity = int(data.get("capacity"))
            if capacity <= 0:
                raise ValueError
            validated["capacity"] = capacity
        except (ValueError, TypeError):
            errors["capacity"] = "Capacity must be a positive integer."

    if "location" in data:
        location = (data.get("location") or "").strip()
        validated["location"] = location

    return validated, errors
