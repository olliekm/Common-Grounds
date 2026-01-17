import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client

load_dotenv()

from models import (
    Event, EventCreate,
    User, UserCreate,
    SwipeRequest, SwipeResponse,
    Analytics,
)


app = FastAPI()

# Supabase client
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL", ""),
    os.environ.get("SUPABASE_KEY", "")
)


# Events
@app.post("/events", response_model=Event)
def create_event(event: EventCreate):
    """Create a new event."""
    data = supabase.table("events").insert(event.model_dump()).execute()
    return data.data[0]


@app.get("/events", response_model=list[Event])
def get_events(user_id: int, matcha_mode: bool, limit: int = 10):
    """
    Get events for a user filtered by mode (matcha or coffee).
    The user_id is passed to the recommendation engine for personalized suggestions.
    """

    """
    {
        1: embedlkmaed,
        2: nfweklfnlw;ekfw,
    }
    """
    # TODO: GET ALL EVENTS AND EMBEDINGS PASS AS DICTIONARY
    # TODO: Integrate with recommendation engine using user_id
    # TODO: Filter out events user has already seen
    data = supabase.table("events").select("*").limit(limit).execute()
    return data.data


@app.get("/events/{event_id}", response_model=Event)
def get_event(event_id: int):
    """Get a specific event by ID."""
    data = supabase.table("events").select("*").eq("id", event_id).execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return data.data[0]


# Swipes/Analytics
@app.post("/swipe", response_model=SwipeResponse)
def swipe_event(swipe: SwipeRequest):
    """Record a swipe (left/right) on an event for a user."""
    # TODO add id to seen on user object
    time_spent = (swipe.view_end - swipe.view_start).total_seconds()
    liked = swipe.direction == "right"

    analytics_record = {
        "user_id": swipe.user_id,
        "event_id": swipe.event_id,
        "time_spent": time_spent,
        "liked": liked,
        "matcha_mode": swipe.matcha_mode,
    }
    data = supabase.table("analytics").insert(analytics_record).execute()

    return SwipeResponse(
        id=data.data[0]["id"],
        user_id=swipe.user_id,
        event_id=swipe.event_id,
        time_spent=time_spent,
        liked=liked,
        matcha_mode=swipe.matcha_mode,
    )


# Users
@app.post("/users", response_model=User)
def create_user(user: UserCreate):
    """Create a new user."""
    data = supabase.table("users").insert(user.model_dump()).execute()
    return data.data[0]


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    """Get a user by ID."""
    data = supabase.table("users").select("*").eq("id", user_id).execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="User not found")
    return data.data[0]


# Analytics
@app.get("/users/{user_id}/analytics", response_model=list[Analytics])
def get_user_analytics(user_id: int, matcha_mode: Optional[bool] = None):
    """Get analytics for a user, optionally filtered by mode."""
    query = supabase.table("analytics").select("*").eq("user_id", user_id)
    if matcha_mode is not None:
        query = query.eq("matcha_mode", matcha_mode)
    data = query.execute()
    return data.data
