from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class TransactionType(enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    note = Column(String, nullable=True)
    category = Column(String, nullable=True)
    payment_mode = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships (optional, for ORM navigation)
    user = relationship("User", foreign_keys=[user_id])
    paid_by_user = relationship("User", foreign_keys=[paid_by])
    group = relationship("Group")

class ArchivedTransaction(Base):
    __tablename__ = "archived_transactions"

    id = Column(Integer, primary_key=True, index=True)
    original_transaction_id = Column(Integer, nullable=True)  # Reference to original transaction if it existed
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    note = Column(String, nullable=True)
    category = Column(String, nullable=True)
    payment_mode = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)  # Original transaction date
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Archive-specific fields
    archived_at = Column(DateTime(timezone=True), server_default=func.now())
    archived_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    archive_reason = Column(String, nullable=True)  # e.g., "group_deleted", "manual_archive"
    group_name = Column(String, nullable=True)  # Store group name for reference after group deletion

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    paid_by_user = relationship("User", foreign_keys=[paid_by])
    archived_by_user = relationship("User", foreign_keys=[archived_by])
    group = relationship("Group")

class DeletedTransaction(Base):
    __tablename__ = "deleted_transactions"

    id = Column(Integer, primary_key=True, index=True)
    original_transaction_id = Column(Integer, nullable=True)  # Reference to original transaction if it existed
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)  # Can be null if group was deleted
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    note = Column(String, nullable=True)
    category = Column(String, nullable=True)
    payment_mode = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)  # Original transaction date
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Deletion-specific fields
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    deletion_reason = Column(String, nullable=True)  # e.g., "user_deleted", "group_deleted"
    group_name = Column(String, nullable=True)  # Store group name for reference after group deletion

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    paid_by_user = relationship("User", foreign_keys=[paid_by])
    deleted_by_user = relationship("User", foreign_keys=[deleted_by])
    group = relationship("Group")