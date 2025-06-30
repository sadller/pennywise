from pydantic import BaseModel, Field
from typing import Optional
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

class TransactionResponse(TransactionBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class ArchivedTransactionBase(TransactionBase):
    original_transaction_id: Optional[int] = None
    archived_at: Optional[datetime] = None
    archived_by: int
    archive_reason: Optional[str] = None
    group_name: Optional[str] = None

class ArchivedTransactionCreate(ArchivedTransactionBase):
    pass

class ArchivedTransactionResponse(ArchivedTransactionBase):
    id: int
    date: datetime
    archived_at: datetime

    class Config:
        orm_mode = True

class DeletedTransactionBase(TransactionBase):
    original_transaction_id: Optional[int] = None
    deleted_at: Optional[datetime] = None
    deleted_by: int
    deletion_reason: Optional[str] = None
    group_name: Optional[str] = None

class DeletedTransactionCreate(DeletedTransactionBase):
    pass

class DeletedTransactionResponse(DeletedTransactionBase):
    id: int
    date: datetime
    deleted_at: datetime

    class Config:
        orm_mode = True 