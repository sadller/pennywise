import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLAlchemy setup using settings
# Check for DATABASE_URL first (for deployment), fallback to individual env vars
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Convert postgres:// to postgresql:// for newer SQLAlchemy versions
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for SQLAlchemy models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """
    Test database connection using SQLAlchemy
    """
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            result = connection.execute(text("SELECT NOW();"))
            row = result.fetchone()
            if row:
                current_time = row[0]
                print("Database connection successful!")
                print(f"Current Time: {current_time}")
                return True
            else:
                print("Database connection failed: No result returned")
                return False
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def init_db():
    """
    Initialize database tables
    """
    try:
        # Create all tables using SQLAlchemy
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully!")
            
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise 