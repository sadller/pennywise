from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    is_actionable: bool = False
    action_data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    title: Optional[str] = None
    message: Optional[str] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total_count: int
    unread_count: int 