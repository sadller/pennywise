from sqlalchemy.orm import Session, aliased
from sqlalchemy import desc
from typing import List, Optional
from app.models.transaction import Transaction
from app.models.group_member import GroupMember
from app.models.user import User
from app.schemas.transaction import TransactionCreate, BulkTransactionCreate, TransactionUpdate
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
        
        # Get transaction with user information
        PaidByUser = aliased(User)
        result = self.db.query(
            Transaction,
            User.full_name.label('user_full_name'),
            User.email.label('user_email'),
            User.username.label('user_username'),
            PaidByUser.full_name.label('paid_by_full_name'),
            PaidByUser.email.label('paid_by_email'),
            PaidByUser.username.label('paid_by_username')
        ).join(
            User, Transaction.user_id == User.id
        ).outerjoin(
            PaidByUser, Transaction.paid_by == PaidByUser.id
        ).filter(
            Transaction.id == db_transaction.id
        ).first()
        
        if result:
            transaction = result[0]
            # Add user information to the transaction object
            transaction.user_full_name = result[1]
            transaction.user_email = result[2]
            transaction.user_username = result[3]
            transaction.paid_by_full_name = result[4]
            transaction.paid_by_email = result[5]
            transaction.paid_by_username = result[6]
            return transaction
        
        return db_transaction

    def create_bulk_transactions(self, bulk_data: BulkTransactionCreate, user_id: int) -> List[Transaction]:
        """Create multiple transactions in bulk with validation."""
        if not bulk_data.transactions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No transactions provided"
            )

        # Validate that user is a member of the group (assuming all transactions are for the same group)
        first_transaction = bulk_data.transactions[0]
        member = self.db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.group_id == first_transaction.group_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group"
            )

        # Validate all transactions are for the same group
        group_id = first_transaction.group_id
        for transaction in bulk_data.transactions:
            if transaction.group_id != group_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="All transactions must be for the same group"
                )

        # Get all group members for validation
        group_members = self.db.query(GroupMember.user_id).filter(
            GroupMember.group_id == group_id
        ).all()
        group_member_ids = {member.user_id for member in group_members}

        # Validate paid_by users if specified
        for transaction in bulk_data.transactions:
            if transaction.paid_by is not None and transaction.paid_by not in group_member_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"The 'paid_by' user (ID: {transaction.paid_by}) is not a member of the group"
                )

        # Create all transactions
        db_transactions = []
        for transaction_data in bulk_data.transactions:
            db_transaction = Transaction(**transaction_data.dict())
            self.db.add(db_transaction)
            db_transactions.append(db_transaction)
        
        self.db.commit()
        
        # Get all created transaction IDs
        transaction_ids = [t.id for t in db_transactions]
        
        # Get transactions with user information
        PaidByUser = aliased(User)
        results = self.db.query(
            Transaction,
            User.full_name.label('user_full_name'),
            User.email.label('user_email'),
            User.username.label('user_username'),
            PaidByUser.full_name.label('paid_by_full_name'),
            PaidByUser.email.label('paid_by_email'),
            PaidByUser.username.label('paid_by_username')
        ).join(
            User, Transaction.user_id == User.id
        ).outerjoin(
            PaidByUser, Transaction.paid_by == PaidByUser.id
        ).filter(
            Transaction.id.in_(transaction_ids)
        ).all()
        
        # Convert results to Transaction objects with user information
        transactions_with_user_info = []
        for result in results:
            transaction = result[0]  # The Transaction object
            # Add user information to the transaction object
            transaction.user_full_name = result[1]
            transaction.user_email = result[2]
            transaction.user_username = result[3]
            transaction.paid_by_full_name = result[4]
            transaction.paid_by_email = result[5]
            transaction.paid_by_username = result[6]
            transactions_with_user_info.append(transaction)
        
        return transactions_with_user_info

    def get_user_transactions(
        self, 
        user_id: int, 
        group_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """Get transactions for a user with optional group filtering."""
        transactions, _ = self.get_user_transactions_with_count(user_id, group_id, skip, limit)
        return transactions

    def get_user_transactions_with_count(
        self, 
        user_id: int, 
        group_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Transaction], int]:
        """Get transactions for a user with optional group filtering and total count."""
        # Query with user joins to get user information
        PaidByUser = aliased(User)
        
        query = self.db.query(
            Transaction,
            User.full_name.label('user_full_name'),
            User.email.label('user_email'),
            User.username.label('user_username'),
            PaidByUser.full_name.label('paid_by_full_name'),
            PaidByUser.email.label('paid_by_email'),
            PaidByUser.username.label('paid_by_username')
        ).join(
            User, Transaction.user_id == User.id
        ).outerjoin(
            PaidByUser, Transaction.paid_by == PaidByUser.id
        )
        
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
                return [], 0
        
        # Get total count before applying pagination
        total_count = query.count()
        
        # Apply pagination
        results = query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()
        
        # Convert results to Transaction objects with user information
        transactions = []
        for result in results:
            transaction = result[0]  # The Transaction object
            # Add user information to the transaction object
            transaction.user_full_name = result[1]
            transaction.user_email = result[2]
            transaction.user_username = result[3]
            transaction.paid_by_full_name = result[4]
            transaction.paid_by_email = result[5]
            transaction.paid_by_username = result[6]
            transactions.append(transaction)
        
        return transactions, total_count

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

    def update_transaction(self, transaction_id: int, transaction_update: TransactionUpdate, user_id: int) -> Transaction:
        """Update a transaction if user has permission."""
        # Verify transaction exists
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
                detail="You don't have permission to update this transaction"
            )

        # Validate that the new group_id is accessible by the user
        if transaction_update.group_id != transaction.group_id:
            new_group_member = self.db.query(GroupMember).filter(
                GroupMember.user_id == user_id,
                GroupMember.group_id == transaction_update.group_id
            ).first()
            if not new_group_member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to move this transaction to the specified group"
                )

        # Validate paid_by user if specified
        if transaction_update.paid_by is not None:
            paid_by_member = self.db.query(GroupMember).filter(
                GroupMember.user_id == transaction_update.paid_by,
                GroupMember.group_id == transaction_update.group_id
            ).first()
            if not paid_by_member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The 'paid_by' user is not a member of the group"
                )

        # Update all transaction fields from the update data
        # Only update the model fields, not the user information fields
        model_fields = [
            'group_id', 'user_id', 'amount', 'type', 'note', 
            'category', 'payment_mode', 'date', 'paid_by'
        ]
        for field in model_fields:
            value = getattr(transaction_update, field)
            setattr(transaction, field, value)

        self.db.commit()
        self.db.refresh(transaction)

        # Query to get the updated transaction with user information
        PaidByUser = aliased(User)
        result = self.db.query(
            Transaction,
            User.full_name.label('user_full_name'),
            User.email.label('user_email'),
            User.username.label('user_username'),
            PaidByUser.full_name.label('paid_by_full_name'),
            PaidByUser.email.label('paid_by_email'),
            PaidByUser.username.label('paid_by_username')
        ).join(
            User, Transaction.user_id == User.id
        ).outerjoin(
            PaidByUser, Transaction.paid_by == PaidByUser.id
        ).filter(
            Transaction.id == transaction_id
        ).first()

        if result:
            updated_transaction = result[0]
            # Add user information to the transaction object
            updated_transaction.user_full_name = result[1]
            updated_transaction.user_email = result[2]
            updated_transaction.user_username = result[3]
            updated_transaction.paid_by_full_name = result[4]
            updated_transaction.paid_by_email = result[5]
            updated_transaction.paid_by_username = result[6]
            return updated_transaction

        return transaction

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