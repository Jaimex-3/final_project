import os
import tempfile
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
    admin = Role(name="admin")
    proctor = Role(name="proctor")
    db_session.add_all([admin, proctor])
    db_session.commit()
    return {"admin": admin, "proctor": proctor}


@pytest.fixture()
def users(db_session, roles):
    admin = User(email="admin@test.com", full_name="Admin", role_id=roles["admin"].id)
    admin.set_password("pass")
    proctor = User(email="proctor@test.com", full_name="Proctor", role_id=roles["proctor"].id)
    proctor.set_password("pass")
    db_session.add_all([admin, proctor])
    db_session.commit()
    return {"admin": admin, "proctor": proctor}


@pytest.fixture()
def tokens(app, users):
    with app.app_context():
        return {
            "admin": create_access_token(identity=users["admin"].id, additional_claims={"role": "admin", "email": users["admin"].email}),
            "proctor": create_access_token(identity=users["proctor"].id, additional_claims={"role": "proctor", "email": users["proctor"].email}),
        }


@pytest.fixture()
def exam(db_session, users):
    room = Room(name="Room A", capacity=10)
    db_session.add(room)
    db_session.flush()
    exam = Exam(title="Test Exam", start_at="2024-01-01 10:00", end_at="2024-01-01 12:00", room_id=room.id)
    db_session.add(exam)
    db_session.commit()
    return exam


@pytest.fixture()
def student(db_session):
    student = Student(student_number="S001", full_name="Student One", email="s1@test.com")
    db_session.add(student)
    db_session.commit()
    return student
