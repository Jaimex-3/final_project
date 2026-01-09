import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# Load env variables
load_dotenv(".env")

from sqlalchemy import create_engine, text

db_url = os.getenv("DATABASE_URL")

def seed_data():
    print("Connecting to database...")
    engine = create_engine(db_url)
    
    with engine.connect() as connection:
        print("Connected.")
        
        # 1. Insert Roles (if they don't exist)
        print("Seeding roles...")
        connection.execute(text("INSERT IGNORE INTO roles (id, name, description) VALUES (1, 'admin', 'System administrator')"))
        connection.execute(text("INSERT IGNORE INTO roles (id, name, description) VALUES (2, 'proctor', 'Exam proctor')"))
        
        # 2. Insert Admin User
        # Werkzeug security uses pbkdf2:sha256 by default (matches User model)
        admin_email = "admin@example.com"
        admin_password = "admin" # Simple password for dev
        password_hash = generate_password_hash(admin_password)
        
        print(f"Seeding user: {admin_email}...")
        # We use a query to check if the user exists first or use INSERT IGNORE
        # But we want to ensure the password is what we expect.
        connection.execute(text("""
            INSERT INTO users (role_id, email, full_name, password_hash, is_active)
            VALUES (1, :email, 'Admin User', :password_hash, 1)
            ON DUPLICATE KEY UPDATE password_hash = :password_hash
        """), {"email": admin_email, "password_hash": password_hash})
        
        connection.commit()
        print("Seed data applied successfully.")

if __name__ == "__main__":
    seed_data()
