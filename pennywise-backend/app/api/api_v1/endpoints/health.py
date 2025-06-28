from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User

router = APIRouter()


@router.get("/health")
def health_check():
    """
    Basic health check endpoint
    """
    return {"status": "healthy", "message": "Pennywise API is running"}


@router.get("/health/db")
def database_health_check(db: Session = Depends(get_db)):
    """
    Database health check endpoint
    """
    try:
        # Try to execute a simple query
        db.execute("SELECT 1")
        return {"status": "healthy", "message": "Database connection is working"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        ) 