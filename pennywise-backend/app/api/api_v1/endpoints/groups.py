from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Group, GroupMember, User
from app.schemas import GroupCreate, GroupResponse
from typing import List
from app.api.api_v1.endpoints.auth import get_current_user
from pydantic import BaseModel

class AddMemberRequest(BaseModel):
    user_email: str

router = APIRouter()

@router.post("/", response_model=GroupResponse)
def create_group(
    group: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new group and add the creator as admin."""
    db_group = Group(
        name=group.name,
        owner_id=current_user.id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add creator as admin member
    group_member = GroupMember(
        user_id=current_user.id,
        group_id=db_group.id,
        role="admin"
    )
    db.add(group_member)
    db.commit()
    
    return db_group

@router.get("/", response_model=List[GroupResponse])
def list_user_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all groups where the current user is a member."""
    groups = db.query(Group).join(GroupMember).filter(
        GroupMember.user_id == current_user.id
    ).all()
    return groups

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific group if user is a member."""
    group = db.query(Group).join(GroupMember).filter(
        Group.id == group_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you don't have access"
        )
    
    return group

@router.post("/{group_id}/members")
def add_group_member(
    group_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a user to a group (only group admin can do this)."""
    # Check if current user is admin of the group
    group_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first()
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admins can add members"
        )
    
    # Find user by email
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a member
    existing_member = db.query(GroupMember).filter(
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
    db.add(new_member)
    db.commit()
    
    return {"message": "User added to group successfully"}

@router.get("/{group_id}/members")
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a group."""
    # Check if user is a member of the group
    group_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this group"
        )
    
    members = db.query(User).join(GroupMember).filter(
        GroupMember.group_id == group_id
    ).all()
    
    return members 