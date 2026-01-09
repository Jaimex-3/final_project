from ..extensions import db
from .base import BaseModel


class Room(BaseModel):
    __tablename__ = "rooms"

    name = db.Column(db.String(100), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(255))

    exams = db.relationship("Exam", back_populates="room", lazy="select")
