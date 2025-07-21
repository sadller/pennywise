from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

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