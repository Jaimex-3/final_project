import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")

def inspect_alembic_version():
    engine = create_engine(db_url)
    with engine.connect() as connection:
        result = connection.execute(text("DESCRIBE alembic_version"))
        for row in result:
            print(row)

if __name__ == "__main__":
    inspect_alembic_version()
