import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")

def fix_alembic_version_table():
    engine = create_engine(db_url)
    with engine.connect() as connection:
        print("Altering alembic_version table...")
        connection.execute(text("ALTER TABLE alembic_version MODIFY version_num VARCHAR(255)"))
        connection.commit()
        print("Done.")

if __name__ == "__main__":
    fix_alembic_version_table()
