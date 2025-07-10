from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserResponse
from app.schemas.transaction import TransactionCreate, TransactionResponse
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


@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    group_id: Optional[int] = Query(None, description="Filter by group ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get transactions for the current user with optional group filtering."""
    transaction_service = TransactionService(db)
    return transaction_service.get_user_transactions(
        user_id=current_user.id,
        group_id=group_id,
        skip=skip,
        limit=limit
    )


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