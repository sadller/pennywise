from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from typing import List, Dict, Any
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User
from app.models.transaction import Transaction
from pydantic import BaseModel


class RecentTransaction(BaseModel):
    id: int
    amount: float
    note: str
    date: str
    paid_by: int
    paid_by_name: str
    group_id: int
    group_name: str


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_recent_transactions(self, user_id: int, limit: int = 5) -> List[RecentTransaction]:
        """Get recent transactions from all user's groups using raw SQL."""
        try:
            query = text("""
                SELECT 
                    t.id,
                    t.amount,
                    t.note,
                    t.date,
                    t.paid_by,
                    t.group_id,
                    g.name as group_name,
                    u.full_name as paid_by_name
                FROM transactions t
                JOIN groups g ON t.group_id = g.id
                LEFT JOIN users u ON t.paid_by = u.id
                JOIN group_members gm ON t.group_id = gm.group_id
                WHERE gm.user_id = :user_id
                ORDER BY t.date DESC
                LIMIT :limit
            """)
            
            result = self.db.execute(query, {"user_id": user_id, "limit": limit})
            transactions = result.fetchall()
            
            return [
                RecentTransaction(
                    id=t.id,
                    amount=float(t.amount),
                    note=t.note,
                    date=t.date.isoformat(),
                    paid_by=t.paid_by,
                    paid_by_name=t.paid_by_name,
                    group_id=t.group_id,
                    group_name=t.group_name
                )
                for t in transactions
            ]
        except Exception as e:
            print(f"Error in get_recent_transactions: {e}")
            return []

    def get_user_dashboard_stats(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics for a user using raw SQL."""
        try:
            query = text("""
                WITH user_groups AS (
                    SELECT gm.group_id
                    FROM group_members gm
                    WHERE gm.user_id = :user_id
                ),
                group_stats AS (
                    SELECT 
                        COUNT(DISTINCT ug.group_id) as total_groups,
                        COUNT(t.id) as total_transactions,
                        COALESCE(SUM(t.amount), 0) as total_amount,
                        COUNT(CASE WHEN t.date >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_activity_count
                    FROM user_groups ug
                    LEFT JOIN transactions t ON ug.group_id = t.group_id
                )
                SELECT 
                    total_groups,
                    total_transactions,
                    total_amount,
                    recent_activity_count
                FROM group_stats
            """)
            
            result = self.db.execute(query, {"user_id": user_id})
            stats = result.fetchone()
            
            if not stats:
                return {
                    "total_groups": 0,
                    "total_transactions": 0,
                    "total_amount": 0.0,
                    "recent_activity_count": 0
                }
            
            return {
                "total_groups": stats.total_groups or 0,
                "total_transactions": stats.total_transactions or 0,
                "total_amount": float(stats.total_amount or 0),
                "recent_activity_count": stats.recent_activity_count or 0
            }
        except Exception as e:
            print(f"Error in get_user_dashboard_stats: {e}")
            return {
                "total_groups": 0,
                "total_transactions": 0,
                "total_amount": 0.0,
                "recent_activity_count": 0
            } 