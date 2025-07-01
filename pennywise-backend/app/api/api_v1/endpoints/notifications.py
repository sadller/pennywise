from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.api.api_v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from sqlalchemy import and_
from app.models.group_member import GroupMember

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user"""
    notifications, total_count, unread_count = NotificationService.get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        unread_only=unread_only
    )
    
    return NotificationListResponse(
        notifications=[NotificationResponse.from_orm(notification) for notification in notifications],
        total_count=total_count,
        unread_count=unread_count
    )


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the count of unread notifications"""
    count = NotificationService.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.put("/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    count = NotificationService.mark_all_notifications_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read"""
    notification = NotificationService.mark_notification_as_read(
        db, notification_id, current_user.id
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific notification"""
    success = NotificationService.delete_notification(db, notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted"}


@router.post("/{notification_id}/accept-invitation")
def accept_group_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a group invitation from a notification"""
    # First, get the notification to check if it's a group invitation
    notification = db.query(Notification).filter(
        and_(Notification.id == notification_id, Notification.user_id == current_user.id)
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.notification_type != "group_invitation":
        raise HTTPException(status_code=400, detail="This notification is not a group invitation")
    
    if not notification.action_data or "group_id" not in notification.action_data:
        raise HTTPException(status_code=400, detail="Invalid notification data")
    
    group_id = notification.action_data["group_id"]
    
    # Check if user is already a member of the group
    existing_member = db.query(GroupMember).filter(
        and_(GroupMember.user_id == current_user.id, GroupMember.group_id == group_id)
    ).first()
    
    if existing_member:
        # Delete notification and return
        db.delete(notification)
        db.commit()
        raise HTTPException(status_code=400, detail="You are already a member of this group")
    
    # Add user to the group
    new_member = GroupMember(
        user_id=current_user.id,
        group_id=group_id,
        role="member"
    )
    db.add(new_member)
    
    # Delete the notification after successful action
    db.delete(notification)
    
    db.commit()
    
    return {"message": "Successfully joined the group"}


@router.post("/{notification_id}/decline-invitation")
def decline_group_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Decline a group invitation from a notification"""
    notification = db.query(Notification).filter(
        and_(Notification.id == notification_id, Notification.user_id == current_user.id)
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.notification_type != "group_invitation":
        raise HTTPException(status_code=400, detail="This notification is not a group invitation")
    
    # Delete the notification after declining
    db.delete(notification)
    db.commit()
    
    return {"message": "Invitation declined"} 