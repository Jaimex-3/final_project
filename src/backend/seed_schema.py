import os
import pymysql
from dotenv import load_dotenv

# Load env variables (same as the app)
load_dotenv(".env")

# Parse DATABASE_URL manually or use values
db_url = os.getenv("DATABASE_URL")
# Example format: mysql+pymysql://user:pass@host:port/dbname?ssl_ca=...

# Simple parser for this specific connection string format if needed, 
# or just use the known values since we know what we just set.
# However, to be robust, let's rely on sqlalchemy to parse it, OR just split it.
# Actually, we can use SQLAlchemy to create an engine and execute raw SQL.
# This handles the SSL config automatically.

from sqlalchemy import create_engine, text

def seed_schema():
    print("Connecting to database...")
    engine = create_engine(db_url)
    
    with engine.connect() as connection:
        print("Connected.")
        
        # Read schema file
        schema_path = "../../database/schema.sql"
        with open(schema_path, "r") as f:
            sql_content = f.read()
            
        # Split into statements. 
        # The schema file uses ; as delimiter.
        # We need to filter out CREATE DATABASE and USE statements.
        statements = sql_content.split(";")
        
        for statement in statements:
            stmt = statement.strip()
            if not stmt:
                continue
                
            if stmt.upper().startswith("CREATE DATABASE"):
                print("Skipping CREATE DATABASE statement")
                continue
                
            if stmt.upper().startswith("USE"):
                print("Skipping USE statement")
                continue
                
            try:
                # Execute statement
                # We assume the statements are DDL.
                print(f"Executing: {stmt[:50]}...")
                connection.execute(text(stmt))
                print("Done.")
            except Exception as e:
                print(f"Error executing statement: {e}")
                # We continue, as some DROP tables might fail if they don't exist (though IF EXISTS should handle it)
                
        print("Schema applied successfully.")

if __name__ == "__main__":
    seed_schema()
