import io

import pytest


def auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}


def test_admin_route_blocked_for_proctor(client, tokens):
    resp = client.get("/api/admin/exams", headers=auth_header(tokens["proctor"]))
    assert resp.status_code == 403


def test_missing_image_returns_400(client, tokens, exam, student):
    resp = client.post(
        "/api/proctor/checkins",
        data={
            "exam_id": exam.id,
            "student_id": student.id,
            "entered_seat_code": "A1",
        },
        headers=auth_header(tokens["proctor"]),
    )
    assert resp.status_code == 400


def test_invalid_exam_returns_404(client, tokens, student):
    data = {
        "exam_id": 999,
        "student_id": student.id,
        "entered_seat_code": "A1",
        "photo": (io.BytesIO(b"img"), "photo.jpg"),
    }
    resp = client.post(
        "/api/proctor/checkins",
        data=data,
        content_type="multipart/form-data",
        headers=auth_header(tokens["proctor"]),
    )
    assert resp.status_code == 404


def test_missing_seat_code_still_processes(client, tokens, exam, student):
    data = {
        "exam_id": exam.id,
        "student_id": student.id,
        "photo": (io.BytesIO(b"img"), "photo.jpg"),
    }
    resp = client.post(
        "/api/proctor/checkins",
        data=data,
        content_type="multipart/form-data",
        headers=auth_header(tokens["proctor"]),
    )
    assert resp.status_code in (201, 400, 409, 422)  # ensure route responds, not 500
