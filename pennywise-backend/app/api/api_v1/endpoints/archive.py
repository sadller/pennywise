from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.archive_service import ArchiveService
from app.schemas.transaction import ArchivedTransactionResponse, DeletedTransactionResponse, TransactionResponse
from app.api.api_v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.delete("/transactions/{transaction_id}/delete", response_model=DeletedTransactionResponse)
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

@router.post("/transactions/{transaction_id}/archive", response_model=ArchivedTransactionResponse)
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

@router.get("/archived-transactions", response_model=List[ArchivedTransactionResponse])
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

@router.get("/deleted-transactions", response_model=List[DeletedTransactionResponse])
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

@router.post("/archived-transactions/{archived_transaction_id}/restore", response_model=TransactionResponse)
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

@router.post("/deleted-transactions/{deleted_transaction_id}/restore", response_model=TransactionResponse)
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