from flask import Flask

from .api.auth import auth_bp
from .api.exams import admin_exams_bp, admin_rooms_bp, proctor_exams_bp
from .api.reports import admin_reports_bp
from .api.seating import seating_bp
from .api.students import admin_students_bp
from .api.checkins import proctor_checkins_bp
from .api.violations import admin_violations_bp, proctor_violations_bp


def register_routes(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_students_bp)
    app.register_blueprint(admin_exams_bp)
    app.register_blueprint(admin_rooms_bp)
    app.register_blueprint(proctor_exams_bp)
    app.register_blueprint(seating_bp)
    app.register_blueprint(proctor_checkins_bp)
    app.register_blueprint(proctor_violations_bp)
    app.register_blueprint(admin_violations_bp)
    app.register_blueprint(admin_reports_bp)
