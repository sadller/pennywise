from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserResponse
from app.schemas.transaction import TransactionCreate, TransactionResponse, BulkTransactionCreate, PaginatedTransactionResponse, TransactionUpdate
from app.services.transaction_service import TransactionService
from app.api.api_v1.endpoints.auth import get_current_user
from typing import List, Optional

router = APIRouter()


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new transaction."""
    transaction_service = TransactionService(db)
    return transaction_service.create_transaction(transaction, current_user.id)


@router.post("/bulk", response_model=List[TransactionResponse])
def create_bulk_transactions(
    bulk_data: BulkTransactionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create multiple transactions in bulk (for CSV import)."""
    transaction_service = TransactionService(db)
    return transaction_service.create_bulk_transactions(bulk_data, current_user.id)


@router.get("/", response_model=PaginatedTransactionResponse)
def list_transactions(
    group_id: Optional[int] = Query(None, description="Filter by group ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get transactions for the current user with optional group filtering."""
    transaction_service = TransactionService(db)
    transactions, total_count = transaction_service.get_user_transactions_with_count(
        user_id=current_user.id,
        group_id=group_id,
        skip=skip,
        limit=limit
    )
    
    # Convert Transaction objects to TransactionResponse objects
    transaction_responses = [TransactionResponse.from_orm(transaction) for transaction in transactions]
    
    return {
        "transactions": transaction_responses,
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total_count
    }


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific transaction by ID."""
    transaction_service = TransactionService(db)
    transaction = transaction_service.get_transaction_by_id(transaction_id, current_user.id)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or you don't have access"
        )
    
    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a transaction."""
    transaction_service = TransactionService(db)
    transaction_service.delete_transaction(transaction_id, current_user.id)
    return {"message": "Transaction deleted successfully"}


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a transaction with complete transaction data."""
    transaction_service = TransactionService(db)
    return transaction_service.update_transaction(transaction_id, transaction_update, current_user.id) 