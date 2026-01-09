from typing import Any, Dict, List, Tuple


def _letters_for_index(idx: int) -> str:
    # Converts 0 -> A, 25 -> Z, 26 -> AA, etc.
    letters = ""
    while True:
        idx, rem = divmod(idx, 26)
        letters = chr(ord("A") + rem) + letters
        if idx == 0:
            break
        idx -= 1
    return letters


def validate_seating_plan_payload(data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """
    Accept either rows/cols (auto seats) or explicit seat_codes list.
    """
    errors: Dict[str, str] = {}
    validated: Dict[str, Any] = {}

    name = (data.get("name") or "Seating Plan").strip()
    validated["name"] = name or "Seating Plan"

    rows = data.get("rows")
    cols = data.get("cols")
    seat_codes = data.get("seat_codes") or data.get("seats")

    has_grid = rows is not None or cols is not None
    has_list = seat_codes is not None
    if has_grid and has_list:
        errors["seats"] = "Provide either rows/cols or seat_codes, not both."
        return validated, errors
    if not has_grid and not has_list:
        errors["seats"] = "Provide rows/cols or seat_codes."
        return validated, errors

    seats: List[Dict[str, Any]] = []
    if has_grid:
        try:
            rows_int = int(rows)
            cols_int = int(cols)
            if rows_int <= 0 or cols_int <= 0:
                raise ValueError
        except (ValueError, TypeError):
            errors["grid"] = "rows and cols must be positive integers."
            return validated, errors

        for r in range(rows_int):
            row_label = _letters_for_index(r)
            for c in range(cols_int):
                seats.append(
                    {
                        "seat_code": f"{row_label}{c + 1}",
                        "row_number": r + 1,
                        "col_number": c + 1,
                    }
                )
    else:
        if not isinstance(seat_codes, list) or not seat_codes:
            errors["seat_codes"] = "seat_codes must be a non-empty list."
            return validated, errors
        seen = set()
        for code in seat_codes:
            code_clean = (code or "").strip().upper()
            if not code_clean:
                errors["seat_codes"] = "Seat codes cannot be empty."
                break
            if code_clean in seen:
                errors["seat_codes"] = f"Duplicate seat code: {code_clean}"
                break
            seen.add(code_clean)
            seats.append({"seat_code": code_clean})

    validated["seats"] = seats
    return validated, errors


def validate_seat_assignments_payload(data: Any) -> Tuple[List[Dict[str, Any]], List[dict]]:
    """
    Expect a list of objects: [{student_id, seat_code}]
    Returns (assignments, errors)
    """
    errors: List[dict] = []
    assignments: List[Dict[str, Any]] = []

    if isinstance(data, dict) and "assignments" in data:
        data = data.get("assignments")

    if not isinstance(data, list) or not data:
        return [], [{"message": "Assignments must be a non-empty list."}]

    seen_students = set()
    seen_seats = set()
    for idx, item in enumerate(data, start=1):
        if not isinstance(item, dict):
            errors.append({"index": idx, "message": "Each assignment must be an object."})
            continue

        student_id = item.get("student_id")
        seat_code = (item.get("seat_code") or "").strip().upper()

        try:
            student_id_int = int(student_id)
            if student_id_int <= 0:
                raise ValueError
        except (ValueError, TypeError):
            errors.append({"index": idx, "field": "student_id", "message": "student_id must be a positive integer"})
            continue

        if not seat_code:
            errors.append({"index": idx, "field": "seat_code", "message": "seat_code is required"})
            continue

        if student_id_int in seen_students:
            errors.append({"index": idx, "field": "student_id", "message": "Duplicate student_id in payload"})
            continue
        if seat_code in seen_seats:
            errors.append({"index": idx, "field": "seat_code", "message": "Duplicate seat_code in payload"})
            continue

        seen_students.add(student_id_int)
        seen_seats.add(seat_code)
        assignments.append({"student_id": student_id_int, "seat_code": seat_code})

    return assignments, errors
