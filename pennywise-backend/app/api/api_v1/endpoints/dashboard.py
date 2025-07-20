from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserResponse
from app.services.dashboard_service import DashboardService, RecentTransaction
from app.api.api_v1.endpoints.auth import get_current_user
from typing import List

router = APIRouter()


@router.get("/recent-transactions", response_model=List[RecentTransaction])
def get_recent_transactions(
    limit: int = Query(5, ge=1, le=50, description="Number of recent transactions to return"),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get recent transactions from all user's groups."""
    dashboard_service = DashboardService(db)
    return dashboard_service.get_recent_transactions(current_user.id, limit)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics for the current user."""
    dashboard_service = DashboardService(db)
    return dashboard_service.get_user_dashboard_stats(current_user.id) 