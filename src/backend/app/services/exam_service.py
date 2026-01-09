from typing import List, Optional

from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Exam, Room


def exam_to_dict(exam: Exam) -> dict:
    return {
        "id": exam.id,
        "title": exam.title,
        "start_at": exam.start_at.isoformat() if exam.start_at else None,
        "end_at": exam.end_at.isoformat() if exam.end_at else None,
        "room_id": exam.room_id,
        "room": room_to_dict(exam.room) if exam.room else None,
    }


def room_to_dict(room: Room) -> dict:
    return {
        "id": room.id,
        "name": room.name,
        "capacity": room.capacity,
        "location": room.location,
    }


# Exams
def list_exams() -> List[Exam]:
    return Exam.query.order_by(Exam.start_at.asc()).all()


def get_exam(exam_id: int) -> Optional[Exam]:
    return Exam.query.get(exam_id)


def create_exam(validated: dict) -> Exam:
    exam = Exam(
        title=validated["title"],
        start_at=validated["start_at"],
        end_at=validated["end_at"],
        room_id=validated.get("room_id"),
    )
    db.session.add(exam)
    _commit()
    return exam


def update_exam(exam: Exam, validated: dict) -> Exam:
    for key in ["title", "start_at", "end_at", "room_id"]:
        if key in validated:
            setattr(exam, key, validated[key])
    _commit()
    return exam


def delete_exam(exam: Exam) -> None:
    db.session.delete(exam)
    _commit()


# Rooms
def list_rooms() -> List[Room]:
    return Room.query.order_by(Room.name.asc()).all()


def get_room(room_id: int) -> Optional[Room]:
    return Room.query.get(room_id)


def create_room(validated: dict) -> Room:
    room = Room(
        name=validated["name"],
        capacity=validated["capacity"],
        location=validated.get("location"),
    )
    db.session.add(room)
    _commit()
    return room


def update_room(room: Room, validated: dict) -> Room:
    for key in ["name", "capacity", "location"]:
        if key in validated:
            setattr(room, key, validated[key])
    _commit()
    return room


def delete_room(room: Room) -> None:
    db.session.delete(room)
    _commit()


def _commit() -> None:
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise
