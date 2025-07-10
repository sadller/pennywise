from sqlalchemy.orm import Session
from sqlalchemy import desc, func
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
        """Get group with detailed statistics."""
        # Verify user is member
        member = self.db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            return None

        # Get group with stats
        result = self.db.query(
            Group.id,
            Group.name,
            Group.owner_id,
            Group.created_at,
            User.full_name.label('owner_name'),
            func.count(GroupMember.user_id.distinct()).label('member_count'),
            func.count(Transaction.id).label('transaction_count'),
            func.coalesce(func.sum(Transaction.amount), 0).label('total_amount')
        ).join(GroupMember, Group.id == GroupMember.group_id)\
         .join(User, Group.owner_id == User.id)\
         .outerjoin(Transaction, Group.id == Transaction.group_id)\
         .filter(Group.id == group_id)\
         .group_by(Group.id, Group.name, Group.owner_id, Group.created_at, User.full_name)\
         .first()

        if not result:
            return None

        return GroupStats(
            id=result.id,
            name=result.name,
            owner_id=result.owner_id,
            owner_name=result.owner_name,
            member_count=result.member_count,
            transaction_count=result.transaction_count,
            total_amount=float(result.total_amount),
            created_at=result.created_at.isoformat()
        )

    def get_user_groups_with_stats(self, user_id: int) -> List[GroupStats]:
        """Get all user's groups with detailed statistics."""
        groups_with_stats = self.db.query(
            Group.id,
            Group.name,
            Group.owner_id,
            Group.created_at,
            User.full_name.label('owner_name'),
            func.count(GroupMember.user_id.distinct()).label('member_count'),
            func.count(Transaction.id).label('transaction_count'),
            func.coalesce(func.sum(Transaction.amount), 0).label('total_amount')
        ).join(GroupMember, Group.id == GroupMember.group_id)\
         .join(User, Group.owner_id == User.id)\
         .outerjoin(Transaction, Group.id == Transaction.group_id)\
         .filter(GroupMember.user_id == user_id)\
         .group_by(Group.id, Group.name, Group.owner_id, Group.created_at, User.full_name)\
         .order_by(desc(Group.created_at)).all()
        
        return [
            GroupStats(
                id=group.id,
                name=group.name,
                owner_id=group.owner_id,
                owner_name=group.owner_name,
                member_count=group.member_count,
                transaction_count=group.transaction_count,
                total_amount=float(group.total_amount),
                created_at=group.created_at.isoformat()
            )
            for group in groups_with_stats
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
            NotificationService.create_group_invitation_notification(
                db=self.db,
                user_id=user.id,
                group_name=group.name,
                inviter_name=group_member.user.full_name or group_member.user.email,
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