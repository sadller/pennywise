from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.models.transaction import Transaction
from app.models.group_member import GroupMember
from app.schemas.transaction import TransactionCreate
from fastapi import HTTPException, status


class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def create_transaction(self, transaction_data: TransactionCreate, user_id: int) -> Transaction:
        """Create a new transaction with validation."""
        # Validate that user is a member of the group
        member = self.db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.group_id == transaction_data.group_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group"
            )

        # Validate paid_by user if specified
        if transaction_data.paid_by is not None:
            paid_by_member = self.db.query(GroupMember).filter(
                GroupMember.user_id == transaction_data.paid_by,
                GroupMember.group_id == transaction_data.group_id
            ).first()
            
            if not paid_by_member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The 'paid_by' user is not a member of the group"
                )

        # Create transaction
        db_transaction = Transaction(**transaction_data.dict())
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        
        return db_transaction

    def get_user_transactions(
        self, 
        user_id: int, 
        group_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """Get transactions for a user with optional group filtering."""
        query = self.db.query(Transaction)
        
        if group_id:
            # Validate user is member of the group
            member = self.db.query(GroupMember).filter(
                GroupMember.user_id == user_id,
                GroupMember.group_id == group_id
            ).first()
            
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not a member of this group"
                )
            
            query = query.filter(Transaction.group_id == group_id)
        else:
            # Get transactions from all user's groups
            user_group_ids = [gm.group_id for gm in self.db.query(GroupMember.group_id).filter(
                GroupMember.user_id == user_id
            ).all()]
            if user_group_ids:
                query = query.filter(Transaction.group_id.in_(user_group_ids))
            else:
                return []
        
        return query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()

    def delete_transaction(self, transaction_id: int, user_id: int) -> bool:
        """Delete a transaction if user has permission."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Check if user has permission (member of the group)
        member = self.db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.group_id == transaction.group_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this transaction"
            )
        
        self.db.delete(transaction)
        self.db.commit()
        
        return True

    def get_transaction_by_id(self, transaction_id: int, user_id: int) -> Optional[Transaction]:
        """Get a specific transaction if user has access."""
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        
        if not transaction:
            return None
        
        # Check if user is member of the group
        member = self.db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.group_id == transaction.group_id
        ).first()
        
        if not member:
            return None
        
        return transaction 