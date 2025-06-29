from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate
from app.models.user import User


class NotificationService:
    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification for a user"""
        db_notification = Notification(**notification_data.dict())
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification

    @staticmethod
    def get_user_notifications(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        unread_only: bool = False
    ) -> tuple[List[Notification], int, int]:
        """Get notifications for a user with pagination"""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        total_count = query.count()
        unread_count = db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).count()
        
        notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
        
        return notifications, total_count, unread_count

    @staticmethod
    def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a specific notification as read"""
        notification = db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        
        return notification

    @staticmethod
    def mark_all_notifications_as_read(db: Session, user_id: int) -> int:
        """Mark all notifications for a user as read"""
        result = db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).update({"is_read": True})
        
        db.commit()
        return result

    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Delete a specific notification"""
        notification = db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        
        return False

    @staticmethod
    def create_group_invitation_notification(
        db: Session, 
        user_id: int, 
        group_name: str, 
        inviter_name: str,
        group_id: int
    ) -> Notification:
        """Create a group invitation notification"""
        notification_data = NotificationCreate(
            user_id=user_id,
            title="Group Invitation",
            message=f"{inviter_name} has invited you to join the group '{group_name}'",
            notification_type="group_invitation",
            is_actionable=True,
            action_data={"group_id": group_id, "group_name": group_name, "inviter_name": inviter_name}
        )
        
        return NotificationService.create_notification(db, notification_data)

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get the count of unread notifications for a user"""
        return db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).count() 