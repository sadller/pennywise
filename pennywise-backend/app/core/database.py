from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLAlchemy setup using settings
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
            result = connection.execute("SELECT NOW();")
            current_time = result.fetchone()[0]
            print("Database connection successful!")
            print(f"Current Time: {current_time}")
            return True
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