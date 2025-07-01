from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import Group, GroupMember, User, Transaction
from typing import List
from app.api.api_v1.endpoints.auth import get_current_user
from pydantic import BaseModel

class GroupStats(BaseModel):
    id: int
    name: str
    owner_id: int
    owner_name: str
    member_count: int
    transaction_count: int
    total_amount: float
    created_at: str

class RecentTransaction(BaseModel):
    id: int
    amount: float
    note: str
    date: str
    paid_by: int
    paid_by_name: str
    group_id: int
    group_name: str

router = APIRouter()

@router.get("/groups", response_model=List[GroupStats])
def get_user_groups_with_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all user's groups with detailed statistics."""
    try:
        # Get groups where user is a member with stats
        groups_with_stats = db.query(
            Group.id,
            Group.name,
            Group.owner_id,
            Group.created_at,
            User.full_name.label('owner_name'),
            func.count(GroupMember.user_id.distinct()).label('member_count'),
            func.count(Transaction.id).label('transaction_count'),
            func.coalesce(func.sum(Transaction.amount), 0).label('total_amount')
        ).join(GroupMember, Group.id == GroupMember.group_id)\
         .join(User, Group.owner_id == User.id)\
         .outerjoin(Transaction, Group.id == Transaction.group_id)\
         .filter(GroupMember.user_id == current_user.id)\
         .group_by(Group.id, Group.name, Group.owner_id, Group.created_at, User.full_name)\
         .order_by(Group.created_at.desc()).all()
        
        return [
            GroupStats(
                id=group.id,
                name=group.name,
                owner_id=group.owner_id,
                owner_name=group.owner_name,
                member_count=group.member_count,
                transaction_count=group.transaction_count,
                total_amount=float(group.total_amount),
                created_at=group.created_at.isoformat()
            )
            for group in groups_with_stats
        ]
    except Exception as e:
        print(f"Error in get_user_groups_with_stats: {e}")
        return []

@router.get("/recent-transactions", response_model=List[RecentTransaction])
def get_recent_transactions(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent transactions from all user's groups."""
    try:
        user_group_ids = db.query(Group.id).join(GroupMember).filter(
            GroupMember.user_id == current_user.id
        ).subquery()
        
        transactions = db.query(
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
        ).order_by(Transaction.date.desc()).limit(limit).all()
        
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