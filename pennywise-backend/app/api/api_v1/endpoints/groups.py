from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserResponse
from app.schemas.group import GroupCreate, GroupResponse
from app.services.group_service import GroupService, GroupStats
from app.api.api_v1.endpoints.auth import get_current_user
from typing import List
from pydantic import BaseModel

class AddMemberRequest(BaseModel):
    user_email: str

class UpdateGroupRequest(BaseModel):
    name: str

router = APIRouter()


@router.post("/", response_model=GroupResponse)
def create_group(
    group: GroupCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new group and add the creator as admin."""
    group_service = GroupService(db)
    return group_service.create_group(group, current_user.id)


@router.get("/", response_model=List[GroupResponse])
def list_user_groups(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all groups where the current user is a member."""
    group_service = GroupService(db)
    return group_service.get_user_groups(current_user.id)


@router.get("/{group_id}/stats", response_model=GroupStats)
def get_group_stats(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get detailed statistics for a specific group."""
    group_service = GroupService(db)
    group_stats = group_service.get_group_with_stats(group_id, current_user.id)
    
    if not group_stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you don't have access"
        )
    
    return group_stats


@router.post("/{group_id}/invite")
def invite_user_to_group(
    group_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Invite a user to a group (only group admin can do this)."""
    group_service = GroupService(db)
    group_service.invite_user_to_group(group_id, request.user_email, current_user.id)
    return {"message": "Invitation sent successfully"}


@router.post("/{group_id}/members")
def add_group_member(
    group_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Add a user to a group (only group admin can do this)."""
    group_service = GroupService(db)
    group_service.add_group_member(group_id, request.user_email, current_user.id)
    return {"message": "User added to group successfully"}


@router.get("/{group_id}/members")
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all members of a group if user is a member."""
    group_service = GroupService(db)
    return group_service.get_group_members(group_id, current_user.id)


@router.delete("/{group_id}/transactions")
def clear_group_transactions(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Clear all transactions in a group if user is the owner."""
    group_service = GroupService(db)
    group_service.clear_group_transactions(group_id, current_user.id)
    return {"message": "All transactions cleared successfully"}


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific group if user is a member."""
    group_service = GroupService(db)
    group = group_service.get_group_by_id(group_id, current_user.id)
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you don't have access"
        )
    
    return group


@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_data: UpdateGroupRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a group if user is the owner."""
    group_service = GroupService(db)
    return group_service.update_group(group_id, group_data.name, current_user.id)


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a group if user is the owner."""
    group_service = GroupService(db)
    group_service.delete_group(group_id, current_user.id)
    return {"message": "Group deleted successfully"} 