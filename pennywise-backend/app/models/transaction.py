from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.constants.transactions import TransactionType

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