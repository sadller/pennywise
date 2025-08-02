from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.constants.transactions import TransactionType

class TransactionBase(BaseModel):
    group_id: int  # Refers to Group
    user_id: int   # Refers to User
    amount: float
    type: TransactionType
    note: Optional[str] = None
    category: Optional[str] = None
    payment_mode: Optional[str] = None
    date: Optional[datetime] = None
    paid_by: Optional[int] = None  # User ID who paid

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    """Complete transaction object for updates - includes all fields"""
    id: int
    group_id: int
    user_id: int
    amount: float
    type: TransactionType
    note: Optional[str] = None
    category: Optional[str] = None
    payment_mode: Optional[str] = None
    date: Optional[datetime] = None
    paid_by: Optional[int] = None
    # User information (optional for updates)
    user_full_name: Optional[str] = None
    user_email: Optional[str] = None
    user_username: Optional[str] = None
    # Paid by user information (optional for updates)
    paid_by_full_name: Optional[str] = None
    paid_by_email: Optional[str] = None
    paid_by_username: Optional[str] = None

class BulkTransactionCreate(BaseModel):
    transactions: List[TransactionCreate]

class TransactionResponse(TransactionBase):
    id: int
    date: Optional[datetime] = None
    # User information
    user_full_name: Optional[str] = None
    user_email: Optional[str] = None
    user_username: Optional[str] = None
    # Paid by user information
    paid_by_full_name: Optional[str] = None
    paid_by_email: Optional[str] = None
    paid_by_username: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedTransactionResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    skip: int
    limit: int
    has_more: bool


# AI Transaction Extraction Schemas
class TransactionExtractRequest(BaseModel):
    """Request payload for transaction extraction."""
    text: str = Field(..., description="Free-form text to extract transactions from.")


class TransactionExtractResponse(BaseModel):
    """Response containing extracted transactions."""
    transactions: List[dict] = Field(..., description="List of extracted transactions.")
    total_count: int = Field(..., description="Total number of transactions extracted.") 