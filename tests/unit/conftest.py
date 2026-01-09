import os
import tempfile
from datetime import datetime
from typing import Generator

import pytest
from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models import Exam, Role, Room, Student, User


@pytest.fixture(scope="session")
def app():
    tmp_dir = tempfile.mkdtemp()
    class TestConfig:
        TESTING = True
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        JWT_SECRET_KEY = "test-secret"
        UPLOAD_FOLDER = os.path.join(tmp_dir, "uploads")
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def db_session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()


@pytest.fixture()
def roles(db_session):
    admin = db_session.query(Role).filter_by(name="admin").first()
    proctor = db_session.query(Role).filter_by(name="proctor").first()
    if not admin:
        admin = Role(name="admin")
        db_session.add(admin)
    if not proctor:
        proctor = Role(name="proctor")
        db_session.add(proctor)
    db_session.commit()
    return {"admin": admin, "proctor": proctor}


@pytest.fixture()
def users(db_session, roles):
    admin = db_session.query(User).filter_by(email="admin@test.com").first()
    if not admin:
        admin = User(email="admin@test.com", full_name="Admin", role_id=roles["admin"].id)
        admin.set_password("pass")
        db_session.add(admin)
    proctor = db_session.query(User).filter_by(email="proctor@test.com").first()
    if not proctor:
        proctor = User(email="proctor@test.com", full_name="Proctor", role_id=roles["proctor"].id)
        proctor.set_password("pass")
        db_session.add(proctor)
    db_session.commit()
    return {"admin": admin, "proctor": proctor}


@pytest.fixture()
def tokens(app, users):
    with app.app_context():
        return {
            "admin": create_access_token(identity=str(users["admin"].id), additional_claims={"role": "admin", "email": users["admin"].email}),
            "proctor": create_access_token(identity=str(users["proctor"].id), additional_claims={"role": "proctor", "email": users["proctor"].email}),
        }


@pytest.fixture()
def exam(db_session, users):
    room = db_session.query(Room).filter_by(name="Room A").first()
    if not room:
        room = Room(name="Room A", capacity=10)
        db_session.add(room)
        db_session.flush()
    start_at = datetime(2024, 1, 1, 10, 0, 0)
    end_at = datetime(2024, 1, 1, 12, 0, 0)
    exam = (
        db_session.query(Exam)
        .filter_by(title="Test Exam", room_id=room.id, start_at=start_at, end_at=end_at)
        .first()
    )
    if not exam:
        exam = Exam(code="TST101", title="Test Exam", start_at=start_at, end_at=end_at, room_id=room.id)
        db_session.add(exam)
    db_session.commit()
    return exam


@pytest.fixture()
def student(db_session):
    student = db_session.query(Student).filter_by(email="s1@test.com").first()
    if not student:
        student = Student(student_number="S001", full_name="Student One", email="s1@test.com")
        db_session.add(student)
    db_session.commit()
    return student
