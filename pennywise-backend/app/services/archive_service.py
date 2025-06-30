from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.transaction import Transaction, ArchivedTransaction, DeletedTransaction
from app.models.group import Group
from app.schemas.transaction import ArchivedTransactionCreate, DeletedTransactionCreate
from datetime import datetime

class ArchiveService:
    
    @staticmethod
    def archive_transaction(
        db: Session, 
        transaction_id: int, 
        archived_by: int, 
        archive_reason: str = "manual_archive"
    ) -> ArchivedTransaction:
        """Archive a single transaction"""
        # Get the original transaction
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")
        
        # Get group name for reference
        group = db.query(Group).filter(Group.id == transaction.group_id).first()
        group_name = group.name if group else None
        
        # Create archived transaction
        archived_transaction = ArchivedTransaction(
            original_transaction_id=transaction.id,
            group_id=transaction.group_id,
            user_id=transaction.user_id,
            amount=transaction.amount,
            type=transaction.type,
            note=transaction.note,
            category=transaction.category,
            payment_mode=transaction.payment_mode,
            date=transaction.date,
            paid_by=transaction.paid_by,
            archived_by=archived_by,
            archive_reason=archive_reason,
            group_name=group_name
        )
        
        db.add(archived_transaction)
        
        # Delete the original transaction
        db.delete(transaction)
        db.commit()
        db.refresh(archived_transaction)
        
        return archived_transaction
    
    @staticmethod
    def archive_group_transactions(
        db: Session, 
        group_id: int, 
        archived_by: int, 
        archive_reason: str = "group_deleted"
    ) -> List[ArchivedTransaction]:
        """Archive all transactions in a group when the group is deleted"""
        # Get all transactions in the group
        transactions = db.query(Transaction).filter(Transaction.group_id == group_id).all()
        
        # Get group name for reference
        group = db.query(Group).filter(Group.id == group_id).first()
        group_name = group.name if group else None
        
        archived_transactions = []
        
        for transaction in transactions:
            archived_transaction = ArchivedTransaction(
                original_transaction_id=transaction.id,
                group_id=transaction.group_id,
                user_id=transaction.user_id,
                amount=transaction.amount,
                type=transaction.type,
                note=transaction.note,
                category=transaction.category,
                payment_mode=transaction.payment_mode,
                date=transaction.date,
                paid_by=transaction.paid_by,
                archived_by=archived_by,
                archive_reason=archive_reason,
                group_name=group_name
            )
            
            archived_transactions.append(archived_transaction)
            db.add(archived_transaction)
        
        # Delete all original transactions
        for transaction in transactions:
            db.delete(transaction)
        
        db.commit()
        
        return archived_transactions
    
    @staticmethod
    def delete_transaction(
        db: Session, 
        transaction_id: int, 
        deleted_by: int, 
        deletion_reason: str = "user_deleted"
    ) -> DeletedTransaction:
        """Move a transaction to deleted transactions table"""
        # Get the original transaction
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")
        
        # Get group name for reference
        group = db.query(Group).filter(Group.id == transaction.group_id).first()
        group_name = group.name if group else None
        
        # Create deleted transaction
        deleted_transaction = DeletedTransaction(
            original_transaction_id=transaction.id,
            group_id=transaction.group_id,
            user_id=transaction.user_id,
            amount=transaction.amount,
            type=transaction.type,
            note=transaction.note,
            category=transaction.category,
            payment_mode=transaction.payment_mode,
            date=transaction.date,
            paid_by=transaction.paid_by,
            deleted_by=deleted_by,
            deletion_reason=deletion_reason,
            group_name=group_name
        )
        
        db.add(deleted_transaction)
        
        # Delete the original transaction
        db.delete(transaction)
        db.commit()
        db.refresh(deleted_transaction)
        
        return deleted_transaction
    
    @staticmethod
    def get_archived_transactions(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ArchivedTransaction]:
        """Get archived transactions for a user"""
        return db.query(ArchivedTransaction).filter(
            ArchivedTransaction.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_deleted_transactions(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[DeletedTransaction]:
        """Get deleted transactions for a user"""
        return db.query(DeletedTransaction).filter(
            DeletedTransaction.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def restore_archived_transaction(
        db: Session, 
        archived_transaction_id: int, 
        user_id: int
    ) -> Transaction:
        """Restore an archived transaction back to active transactions"""
        archived_transaction = db.query(ArchivedTransaction).filter(
            ArchivedTransaction.id == archived_transaction_id,
            ArchivedTransaction.user_id == user_id
        ).first()
        
        if not archived_transaction:
            raise ValueError("Archived transaction not found")
        
        # Create new transaction
        transaction = Transaction(
            group_id=archived_transaction.group_id,
            user_id=archived_transaction.user_id,
            amount=archived_transaction.amount,
            type=archived_transaction.type,
            note=archived_transaction.note,
            category=archived_transaction.category,
            payment_mode=archived_transaction.payment_mode,
            date=archived_transaction.date,
            paid_by=archived_transaction.paid_by
        )
        
        db.add(transaction)
        db.delete(archived_transaction)
        db.commit()
        db.refresh(transaction)
        
        return transaction
    
    @staticmethod
    def restore_deleted_transaction(
        db: Session, 
        deleted_transaction_id: int, 
        user_id: int
    ) -> Transaction:
        """Restore a deleted transaction back to active transactions"""
        deleted_transaction = db.query(DeletedTransaction).filter(
            DeletedTransaction.id == deleted_transaction_id,
            DeletedTransaction.user_id == user_id
        ).first()
        
        if not deleted_transaction:
            raise ValueError("Deleted transaction not found")
        
        # Create new transaction
        transaction = Transaction(
            group_id=deleted_transaction.group_id,
            user_id=deleted_transaction.user_id,
            amount=deleted_transaction.amount,
            type=deleted_transaction.type,
            note=deleted_transaction.note,
            category=deleted_transaction.category,
            payment_mode=deleted_transaction.payment_mode,
            date=deleted_transaction.date,
            paid_by=deleted_transaction.paid_by
        )
        
        db.add(transaction)
        db.delete(deleted_transaction)
        db.commit()
        db.refresh(transaction)
        
        return transaction 