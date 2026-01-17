from typing import Optional, Any
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


# Enums
class SwipeDirection(str, Enum):
    left = "left"
    right = "right"


# User models
class User(BaseModel):
    id: int
    created_at: datetime
    name: Optional[str] = None
    matcha_blurb: Optional[str] = None
    coffee_blurb: Optional[str] = None
    tags: Optional[list[Any]] = None
    embeddings: Optional[list[Any]] = None
    seen: Optional[list[Any]] = None


class UserCreate(BaseModel):
    name: Optional[str] = None
    matcha_blurb: Optional[str] = None
    coffee_blurb: Optional[str] = None
    tags: Optional[list[Any]] = None


# Event models
class Event(BaseModel):
    id: int
    created_at: datetime
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list[Any]] = None
    mode: Optional[list[Any]] = None  # matcha/coffee modes
    embeddings: Optional[list[Any]] = None


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    tags: Optional[list[Any]] = None
    mode: Optional[list[Any]] = None


# Analytics/Swipe models
class SwipeRequest(BaseModel):
    user_id: int
    event_id: int
    direction: SwipeDirection
    view_start: datetime
    view_end: datetime
    matcha_mode: bool


class SwipeResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    time_spent: float
    liked: bool
    matcha_mode: bool


class Analytics(BaseModel):
    id: int
    created_at: datetime
    user_id: Optional[int] = None
    event_id: Optional[int] = None
    time_spent: Optional[float] = None
    liked: Optional[bool] = None
    matcha_mode: Optional[bool] = None
