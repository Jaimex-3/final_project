import pytest

from app.services.seating_service import check_seat_compliance


def test_check_seat_compliance_positive():
    assert check_seat_compliance("A1", "a1") is True


def test_check_seat_compliance_negative():
    assert check_seat_compliance("A1", "B1") is False


def test_check_seat_compliance_empty():
    assert check_seat_compliance("A1", "") is False
    assert check_seat_compliance("", "A1") is False
