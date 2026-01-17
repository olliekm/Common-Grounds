from typing import Optional
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class SwipeDirection(str, Enum):
    left = "left"
    right = "right"


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    tags: Optional[list[str]] = None


class Event(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    tags: Optional[list[str]] = None
    created_at: datetime


class SwipeRequest(BaseModel):
    direction: SwipeDirection


class SwipeResponse(BaseModel):
    event_id: str
    user_id: str
    direction: SwipeDirection
    matched: bool = False
