from datetime import datetime

from fastapi import FastAPI, HTTPException

from models import Event, EventCreate, EventSide, SwipeRequest, SwipeResponse


app = FastAPI()


# In-memory storage (replace with database)
events_db: dict[str, Event] = {}
swipes_db: list[dict] = []



@app.post("/events", response_model=Event)
def create_event(event: EventCreate):
    """Create a new event."""
    event_id = f"evt_{len(events_db) + 1}"
    new_event = Event(
        id=event_id,
        **event.model_dump(),
        created_at=datetime.now()
    )
    events_db[event_id] = new_event
    return new_event


@app.get("/events", response_model=list[Event])
def get_events(user_id: str, side: EventSide, limit: int = 10):
    """
    Get events for a user filtered by side (matcha or coffee).
    The user_id is passed to the recommendation engine for personalized suggestions.
    """
    # TODO: Integrate with recommendation engine using user_id
    filtered = [e for e in events_db.values() if e.side == side]
    return filtered[:limit]


@app.get("/events/{event_id}", response_model=Event)
def get_event(event_id: str):
    """Get a specific event by ID."""
    if event_id not in events_db:
        raise HTTPException(status_code=404, detail="Event not found")
    return events_db[event_id]


@app.post("/events/{event_id}/swipe", response_model=SwipeResponse)
def swipe_event(event_id: str, user_id: str, swipe: SwipeRequest):
    """
    Record a swipe (left/right) on an event for a user.
    This feeds into the recommendation engine.
    """
    if event_id not in events_db:
        raise HTTPException(status_code=404, detail="Event not found")

    swipe_record = {
        "event_id": event_id,
        "user_id": user_id,
        "direction": swipe.direction,
        "timestamp": datetime.now()
    }
    swipes_db.append(swipe_record)

    # TODO: Feed swipe data to recommendation engine
    # TODO: Check for matches if direction is "right"

    return SwipeResponse(
        event_id=event_id,
        user_id=user_id,
        direction=swipe.direction,
        matched=False  # TODO: Implement match logic
    )