from pathlib import Path
from typing import Type

from flask import Flask

from .config import Config
from .extensions import init_extensions

__all__ = ["create_app"]


def create_app(config_object: Type[Config] = Config) -> Flask:
    """Application factory for the Exam Security System."""
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(config_object)

    _ensure_upload_dir(app)
    init_extensions(app)
    _register_routes(app)

    return app


def _ensure_upload_dir(app: Flask) -> None:
    upload_path = Path(app.config["UPLOAD_FOLDER"])
    upload_path.mkdir(parents=True, exist_ok=True)


def _register_routes(app: Flask) -> None:
    try:
        from . import routes  # noqa: WPS433 (import inside function)
    except ImportError:
        return

    if hasattr(routes, "register_routes"):
        routes.register_routes(app)
