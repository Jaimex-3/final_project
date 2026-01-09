from app.schemas.exam import validate_exam_payload


def test_validate_exam_payload_requires_fields():
    validated, errors = validate_exam_payload({})

    assert not validated
    # All required fields should be flagged
    assert errors["title"] == "This field is required."
    assert errors["date"] == "This field is required."
    assert errors["start_time"] == "This field is required."
    assert errors["end_time"] == "This field is required."
    assert errors["room_id"] == "This field is required."


def test_validate_exam_payload_rejects_end_before_start():
    payload = {
        "title": "Test Exam",
        "date": "2024-01-01",
        "start_time": "10:00",
        "end_time": "09:00",
        "room_id": 1,
    }

    validated, errors = validate_exam_payload(payload)

    assert "end_time" in errors
    assert errors["end_time"] == "End time must be after start time."
    assert "start_at" not in validated
    assert "end_at" not in validated


def test_validate_exam_payload_accepts_valid_schedule():
    payload = {
        "title": "Valid Exam",
        "date": "2024-02-02",
        "start_time": "09:00",
        "end_time": "11:00",
        "room_id": 2,
    }

    validated, errors = validate_exam_payload(payload)

    assert errors == {}
    assert validated["title"] == "Valid Exam"
    assert str(validated["start_at"]).startswith("2024-02-02 09:00")
    assert str(validated["end_at"]).startswith("2024-02-02 11:00")
    assert validated["room_id"] == 2
