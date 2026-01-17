from typing import Optional
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class SwipeDirection(str, Enum):
    left = "left"
    right = "right"


class EventSide(str, Enum):
    matcha = "matcha"  # hobbies/fun
    coffee = "coffee"  # professionalism/education


class EventCreate(BaseModel):
    title: str
    side: EventSide
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    tags: Optional[list[str]] = None


class Event(BaseModel):
    id: str
    title: str
    side: EventSide
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
    time_spent: Optional[datetime.timedelta]
    liked: bool
    matcha_mode: bool

class Dashboard(BaseModel):
    person: AnalyticsPerson
    