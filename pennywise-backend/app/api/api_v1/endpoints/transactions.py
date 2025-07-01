from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Transaction, User, GroupMember
from app.schemas import TransactionCreate, TransactionResponse
from typing import List
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure paid_by is a member of the group
    if transaction.paid_by is not None:
        member = db.query(GroupMember).filter(
            GroupMember.user_id == transaction.paid_by,
            GroupMember.group_id == transaction.group_id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The 'paid_by' user is not a member of the group."
            )
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    group_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction)
    
    if group_id:
        # First check if the current user is a member of the specified group
        member = db.query(GroupMember).filter(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == group_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group."
            )
        
        query = query.filter(Transaction.group_id == group_id)
    else:
        # If no group_id provided, only show transactions from groups the user is a member of
        user_groups = db.query(GroupMember.group_id).filter(
            GroupMember.user_id == current_user.id
        ).subquery()
        query = query.filter(Transaction.group_id.in_(user_groups))
    
    return query.order_by(Transaction.date.desc()).all()

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction permanently"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user has permission to delete this transaction
    # (either they created it or they're a member of the group)
    member = db.query(GroupMember).filter(
        GroupMember.user_id == current_user.id,
        GroupMember.group_id == transaction.group_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this transaction"
        )
    
    db.delete(transaction)
    db.commit()
    
    return {"message": "Transaction deleted successfully"} 