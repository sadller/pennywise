from sqlalchemy.orm import Session
from sqlalchemy import func, desc
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
        """Get recent transactions from all user's groups."""
        try:
            user_group_ids = [gm.group_id for gm in self.db.query(GroupMember.group_id).filter(
                GroupMember.user_id == user_id
            ).all()]
            
            if not user_group_ids:
                return []
            
            transactions = self.db.query(
                Transaction.id,
                Transaction.amount,
                Transaction.note,
                Transaction.date,
                Transaction.paid_by,
                Transaction.group_id,
                Group.name.label('group_name'),
                User.full_name.label('paid_by_name')
            ).join(Group).outerjoin(User, Transaction.paid_by == User.id).filter(
                Transaction.group_id.in_(user_group_ids)
            ).order_by(desc(Transaction.date)).limit(limit).all()
            
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
        """Get comprehensive dashboard statistics for a user."""
        try:
            # Get user's groups
            user_group_ids = [gm.group_id for gm in self.db.query(GroupMember.group_id).filter(
                GroupMember.user_id == user_id
            ).all()]
            
            if not user_group_ids:
                return {
                    "total_groups": 0,
                    "total_transactions": 0,
                    "total_amount": 0.0,
                    "recent_activity_count": 0
                }
            
            # Total groups count
            total_groups = self.db.query(func.count(Group.id)).filter(
                Group.id.in_(user_group_ids)
            ).scalar()
            
            # Total transactions count
            total_transactions = self.db.query(func.count(Transaction.id)).filter(
                Transaction.group_id.in_(user_group_ids)
            ).scalar()
            
            # Total amount (sum of all transactions)
            total_amount = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                Transaction.group_id.in_(user_group_ids)
            ).scalar()
            
            # Recent activity (last 7 days)
            from datetime import datetime, timedelta
            week_ago = datetime.utcnow() - timedelta(days=7)
            recent_transactions = self.db.query(func.count(Transaction.id)).filter(
                Transaction.group_id.in_(user_group_ids),
                Transaction.date >= week_ago
            ).scalar()
            
            return {
                "total_groups": total_groups or 0,
                "total_transactions": total_transactions or 0,
                "total_amount": float(total_amount or 0),
                "recent_activity_count": recent_transactions or 0
            }
        except Exception as e:
            print(f"Error in get_user_dashboard_stats: {e}")
            return {
                "total_groups": 0,
                "total_transactions": 0,
                "total_amount": 0.0,
                "recent_activity_count": 0
            } 