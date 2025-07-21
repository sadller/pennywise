from sqlalchemy.orm import Session
from sqlalchemy import desc, func, text
from typing import List, Optional, Dict, Any
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.group import GroupCreate
from app.services.notification_service import NotificationService
from fastapi import HTTPException, status
from pydantic import BaseModel


class GroupStats(BaseModel):
    id: int
    name: str
    owner_id: int
    owner_name: str
    member_count: int
    transaction_count: int
    total_amount: float
    created_at: str
    last_transaction_at: Optional[str] = None


class GroupService:
    def __init__(self, db: Session):
        self.db = db

    def create_group(self, group_data: GroupCreate, user_id: int) -> Group:
        """Create a new group and add creator as admin."""
        # Create group
        db_group = Group(
            name=group_data.name,
            owner_id=user_id
        )
        self.db.add(db_group)
        self.db.commit()
        self.db.refresh(db_group)
        
        # Add creator as admin member
        group_member = GroupMember(
            user_id=user_id,
            group_id=db_group.id,
            role="admin"
        )
        self.db.add(group_member)
        self.db.commit()
        
        return db_group

    def get_user_groups(self, user_id: int) -> List[Group]:
        """Get all groups where user is a member."""
        return self.db.query(Group).join(GroupMember).filter(
            GroupMember.user_id == user_id
        ).all()

    def get_group_by_id(self, group_id: int, user_id: int) -> Optional[Group]:
        """Get a specific group if user is a member."""
        return self.db.query(Group).join(GroupMember).filter(
            Group.id == group_id,
            GroupMember.user_id == user_id
        ).first()

    def get_group_with_stats(self, group_id: int, user_id: int) -> Optional[GroupStats]:
        """Get group with detailed statistics using raw SQL."""
        # Verify user is member
        member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            return None

        # Get group with stats using raw SQL
        query = text("""
            SELECT 
                g.id,
                g.name,
                g.owner_id,
                g.created_at,
                u.full_name as owner_name,
                COUNT(DISTINCT gm.user_id) as member_count,
                COUNT(t.id) as transaction_count,
                COALESCE(SUM(t.amount), 0) as total_amount,
                MAX(t.date) as last_transaction_at
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            JOIN users u ON g.owner_id = u.id
            LEFT JOIN transactions t ON g.id = t.group_id
            WHERE g.id = :group_id
            GROUP BY g.id, g.name, g.owner_id, g.created_at, u.full_name
        """)
        
        result = self.db.execute(query, {"group_id": group_id})
        group_data = result.fetchone()
        
        if not group_data:
            return None

        return GroupStats(
            id=group_data.id,
            name=group_data.name,
            owner_id=group_data.owner_id,
            owner_name=group_data.owner_name,
            member_count=group_data.member_count,
            transaction_count=group_data.transaction_count,
            total_amount=float(group_data.total_amount),
            created_at=group_data.created_at.isoformat(),
            last_transaction_at=group_data.last_transaction_at.isoformat() if group_data.last_transaction_at else None
        )

    def get_user_groups_with_stats(self, user_id: int) -> List[GroupStats]:
        """Get all groups with statistics where user is a member."""
        # Get groups with stats using raw SQL
        query = text("""
            SELECT 
                g.id,
                g.name,
                g.owner_id,
                g.created_at,
                u.full_name as owner_name,
                COUNT(DISTINCT gm.user_id) as member_count,
                COUNT(t.id) as transaction_count,
                COALESCE(SUM(t.amount), 0) as total_amount,
                MAX(t.date) as last_transaction_at
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            JOIN users u ON g.owner_id = u.id
            LEFT JOIN transactions t ON g.id = t.group_id
            WHERE gm.user_id = :user_id
            GROUP BY g.id, g.name, g.owner_id, g.created_at, u.full_name
        """)
        
        result = self.db.execute(query, {"user_id": user_id})
        groups_data = result.fetchall()
        
        return [
            GroupStats(
                id=group_data.id,
                name=group_data.name,
                owner_id=group_data.owner_id,
                owner_name=group_data.owner_name,
                member_count=group_data.member_count,
                transaction_count=group_data.transaction_count,
                total_amount=float(group_data.total_amount),
                created_at=group_data.created_at.isoformat(),
                last_transaction_at=group_data.last_transaction_at.isoformat() if group_data.last_transaction_at else None
            )
            for group_data in groups_data
        ]



    def invite_user_to_group(self, group_id: int, user_email: str, inviter_id: int) -> bool:
        """Invite a user to a group (only group admin can do this)."""
        # Check if inviter is admin of the group
        group_member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == inviter_id,
            GroupMember.role == "admin"
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group admins can invite members"
            )
        
        # Get group details
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        # Find user by email
        user = self.db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already a member
        existing_member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user.id
        ).first()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this group"
            )
        
        # Create notification for the invited user
        try:
            # Get inviter details
            inviter = self.db.query(User).filter(User.id == inviter_id).first()
            inviter_name = "Unknown"
            if inviter:
                inviter_name = inviter.full_name if inviter.full_name else inviter.email
            
            NotificationService.create_group_invitation_notification(
                db=self.db,
                user_id=user.id,
                group_name=group.name,
                inviter_name=inviter_name,
                group_id=group_id
            )
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error sending invitation: {str(e)}"
            )

    def add_group_member(self, group_id: int, user_email: str, admin_id: int) -> bool:
        """Add a user to a group (only group admin can do this)."""
        # Check if admin is admin of the group
        group_member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == admin_id,
            GroupMember.role == "admin"
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group admins can add members"
            )
        
        # Get group details
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        # Find user by email
        user = self.db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already a member
        existing_member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user.id
        ).first()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this group"
            )
        
        # Add user as member
        new_member = GroupMember(
            user_id=user.id,
            group_id=group_id,
            role="member"
        )
        self.db.add(new_member)
        self.db.commit()
        
        return True

    def get_group_members(self, group_id: int, user_id: int) -> List[Dict[str, Any]]:
        """Get all members of a group if user is a member."""
        # Check if user is member of the group
        member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group"
            )
        
        # Get all members with user details
        members = self.db.query(
            GroupMember.user_id,
            GroupMember.role,
            User.email,
            User.full_name,
            User.avatar_url
        ).join(User, GroupMember.user_id == User.id)\
         .filter(GroupMember.group_id == group_id)\
         .all()
        
        return [
            {
                "user_id": member.user_id,
                "role": member.role,
                "email": member.email,
                "full_name": member.full_name,
                "avatar_url": member.avatar_url
            }
            for member in members
        ]

    def delete_group(self, group_id: int, user_id: int) -> bool:
        """Delete a group if user is the owner."""
        group = self.db.query(Group).filter(Group.id == group_id).first()
        
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        if group.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group owner can delete the group"
            )
        
        # Delete all group members first
        self.db.query(GroupMember).filter(GroupMember.group_id == group_id).delete()
        
        # Delete all transactions in the group
        self.db.query(Transaction).filter(Transaction.group_id == group_id).delete()
        
        # Delete the group
        self.db.delete(group)
        self.db.commit()
        
        return True

    def update_group(self, group_id: int, name: str, user_id: int) -> Group:
        """Update a group if user is the owner."""
        group = self.db.query(Group).filter(Group.id == group_id).first()
        
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        if group.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group owner can update the group"
            )
        
        # Update group name
        group.name = name
        self.db.commit()
        self.db.refresh(group)
        
        return group

    def clear_group_transactions(self, group_id: int, user_id: int) -> bool:
        """Clear all transactions in a group if user is the owner."""
        group = self.db.query(Group).filter(Group.id == group_id).first()
        
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        if group.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group owner can clear transactions"
            )
        
        # Delete all transactions in the group
        self.db.query(Transaction).filter(Transaction.group_id == group_id).delete()
        self.db.commit()
        
        return True 