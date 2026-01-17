<<<<<<< HEAD
from typing import Optional, Any
from datetime import datetime
=======
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
>>>>>>> a3c59c8 (analytics initial commit)
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
<<<<<<< HEAD
    id: int
    user_id: int
    event_id: int
    time_spent: float
=======
    event_id: str
    user_id: str
    direction: SwipeDirection
    matched: bool = False

class AnalyticsPerson(BaseModel):
    person_id: str
    coffee_time: float
    coffee_interactions: int
    matcha_time: float
    matcha_interactions: int

class AnalyticsSwipe(BaseModel):
    event_id: str
    person_id: str
    tags: Optional[list[str]] = None
    time_spent: Optional[timedelta]
>>>>>>> a3c59c8 (analytics initial commit)
    liked: bool
    matcha_mode: bool


<<<<<<< HEAD
class Analytics(BaseModel):
    id: int
    created_at: datetime
    user_id: Optional[int] = None
    event_id: Optional[int] = None
    time_spent: Optional[float] = None
    liked: Optional[bool] = None
    matcha_mode: Optional[bool] = None
=======
class Dashboard(BaseModel):
    person: AnalyticsPerson
    coffee: Dict[str, Any]
    matcha: Dict[str, Any]
    total_swipes: int
    overall_like_rate: float
    tags: Dict[str, Any]
    ai_insights: List[str]
>>>>>>> a3c59c8 (analytics initial commit)
