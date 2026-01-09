import os

from app import create_app


def get_config_name() -> str:
    return os.getenv("FLASK_ENV", "production")


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_RUN_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_RUN_PORT", "5000")),
        debug=app.config.get("DEBUG", False),
    )
