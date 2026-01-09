from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# Instantiate extensions (initialized in app factory)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()


def init_extensions(app):
    """Bind extensions to the application instance."""
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
