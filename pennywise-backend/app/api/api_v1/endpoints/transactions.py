from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Transaction, User, GroupMember
from app.schemas import TransactionCreate, TransactionResponse
from app.schemas.transaction import ArchivedTransactionResponse, DeletedTransactionResponse
from app.services.archive_service import ArchiveService
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

# Archive and deletion endpoints
@router.delete("/{transaction_id}/delete", response_model=DeletedTransactionResponse)
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction (move to deleted transactions table)"""
    try:
        deleted_transaction = ArchiveService.delete_transaction(
            db=db,
            transaction_id=transaction_id,
            deleted_by=current_user.id,
            deletion_reason="user_deleted"
        )
        return deleted_transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{transaction_id}/archive", response_model=ArchivedTransactionResponse)
def archive_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive a transaction (move to archived transactions table)"""
    try:
        archived_transaction = ArchiveService.archive_transaction(
            db=db,
            transaction_id=transaction_id,
            archived_by=current_user.id,
            archive_reason="manual_archive"
        )
        return archived_transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/archived", response_model=List[ArchivedTransactionResponse])
def get_archived_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all archived transactions for the current user"""
    archived_transactions = ArchiveService.get_archived_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return archived_transactions

@router.get("/deleted", response_model=List[DeletedTransactionResponse])
def get_deleted_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all deleted transactions for the current user"""
    deleted_transactions = ArchiveService.get_deleted_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return deleted_transactions

@router.post("/archived/{archived_transaction_id}/restore", response_model=TransactionResponse)
def restore_archived_transaction(
    archived_transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore an archived transaction back to active transactions"""
    try:
        transaction = ArchiveService.restore_archived_transaction(
            db=db,
            archived_transaction_id=archived_transaction_id,
            user_id=current_user.id
        )
        return transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/deleted/{deleted_transaction_id}/restore", response_model=TransactionResponse)
def restore_deleted_transaction(
    deleted_transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore a deleted transaction back to active transactions"""
    try:
        transaction = ArchiveService.restore_deleted_transaction(
            db=db,
            deleted_transaction_id=deleted_transaction_id,
            user_id=current_user.id
        )
        return transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) 