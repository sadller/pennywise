from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GroupBase(BaseModel):
    name: str
    owner_id: int

class GroupCreate(BaseModel):
    name: str

class GroupResponse(GroupBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True 