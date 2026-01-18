import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
import numpy as np
from engine.analytics import generate_dashboard
from fastapi.middleware.cors import CORSMiddleware

from engine.ml_models.gemini_client import GeminiClient
from engine.ml_models.embedding_toolbox import EmbeddingToolbox
from engine.recommendation_engine import recommend_events

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

load_dotenv()

from models import (
    Event, EventCreate,
    User, UserCreate,
    SwipeRequest, SwipeResponse,
    Analytics, Dashboard,
)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL", ""),
    os.environ.get("SUPABASE_KEY", "")
)

gemini_client = GeminiClient()

embedding_toolbox = EmbeddingToolbox()
embedding_toolbox.instantiate()

# Events
@app.post("/events", response_model=Event)
def create_event(event: EventCreate):
    """Create a new event."""
    tags = event.tags or []
    description = event.description or ""
    title = event.title

    # Generate embedding for the designated mode
    embedding = embedding_toolbox.encode(description, tags, title)
    embedding_list = embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)

    event_data = event.model_dump()
    if event.matcha_mode:
        event_data["embeddings"] = {"matcha": embedding_list}
    else:
        event_data["embeddings"] = {"coffee": embedding_list}

    data = supabase.table("events").insert(event_data).execute()
    return data.data[0]

@app.get("/events", response_model=list[Event])
def get_events(user_id: int, matcha_mode: bool, limit: int = 10):
    """
    Get events for a user filtered by mode (matcha or coffee).
    Uses the recommendation engine for personalized suggestions.
    Falls back to unseen events if recommendation fails.
    """
    # Get user data (blurb, tags, seen)
    user_data = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_data.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_data.data[0]

    seen = user.get("seen") or []
    user_tags = user.get("tags") or []
    user_blurb = user.get("matcha_blurb") if matcha_mode else user.get("coffee_blurb")
    user_blurb = user_blurb or ""

    # Get events for the requested mode
    events_data = supabase.table("events").select("*").eq("matcha_mode", matcha_mode).execute()
    all_events = events_data.data

    # TRY to use recommendation engine, but fall back if it fails
    try:
        # Build event embeddings dictionary {event_id: embedding}
        event_embeddings_dict = {}
        for event in all_events:
            if event.get("embeddings"):
                emb = event["embeddings"].get("matcha") if matcha_mode else event["embeddings"].get("coffee")
                if emb:
                    event_embeddings_dict[event["id"]] = emb

        print(f"[Recommendation] User {user_id}: {len(event_embeddings_dict)} events with embeddings, {len(seen)} seen")
        blurb_preview = user_blurb[:50] + '...' if len(user_blurb) > 50 else user_blurb if user_blurb else '(empty)'
        print(f"[Recommendation] User blurb: '{blurb_preview}' | Tags: {user_tags}")

        # Get user's swipe analytics for the last 5 seen events (or fewer)
        last_5_seen = seen[-5:] if len(seen) > 5 else seen
        swipes = []
        if last_5_seen:
            analytics_data = supabase.table("analytics").select("*").eq("user_id", user_id).eq("matcha_mode", matcha_mode).in_("event_id", last_5_seen).execute()
            swipes = [Analytics(**record) for record in analytics_data.data]

        # Get recommended event IDs
        recommended_ids = recommend_events(
            event_embeddings_dict=event_embeddings_dict,
            seen=seen,
            EmbeddingToolbox=embedding_toolbox,
            user_blurb=user_blurb,
            user_tags=user_tags,
            GeminiClient=gemini_client,
            swipes=swipes,
            matcha_mode=matcha_mode,
            top_k=limit
        )

        print(f"[Recommendation] Got {len(recommended_ids)} recommendations: {recommended_ids}")

        # Return recommended events in order
        recommended_events = []
        for event_id in recommended_ids:
            for event in all_events:
                if event["id"] == event_id:
                    recommended_events.append(event)
                    break

        # If recommendations are empty, fall back
        if not recommended_events:
            print(f"[Recommendation] Empty results, using fallback for user {user_id}")
            raise ValueError("Empty recommendations")

    except Exception as e:
        # FALLBACK: If recommendation engine fails, return unseen events
        print(f"[Recommendation] Failed for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        print(f"[Recommendation] Falling back to unseen events")
        unseen_events = [e for e in all_events if e["id"] not in seen]
        recommended_events = unseen_events[:limit]

    return recommended_events

@app.get("/events/all", response_model=list[Event])
def get_all_events(matcha_mode: bool, limit: int = 20):
    """
    Get all events filtered by mode without personalization.
    Use this as a fallback when recommendation engine returns empty results.
    """
    events_data = supabase.table("events").select("*").eq("matcha_mode", matcha_mode).limit(limit).execute()
    return events_data.data

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

    # Append event_id to user's seen array
    user_data = supabase.table("users").select("seen, liked_events").eq("id", swipe.user_id).execute()
    seen = user_data.data[0]["seen"] or []
    seen.append(swipe.event_id)

    # If liked, also add to liked_events list
    update_data = {"seen": seen}
    if liked:
        liked_events = user_data.data[0].get("liked_events") or []
        liked_events.append(swipe.event_id)
        update_data["liked_events"] = liked_events

    supabase.table("users").update(update_data).eq("id", swipe.user_id).execute()

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
    tags = user.tags or []
    coffee_blurb = user.coffee_blurb or ""
    matcha_blurb = user.matcha_blurb or ""

    coffee_embedding = embedding_toolbox.encode(coffee_blurb, tags, None)
    matcha_embedding = embedding_toolbox.encode(matcha_blurb, tags, None)

    # Convert numpy arrays to Python lists
    coffee_embeddings = coffee_embedding.tolist() if hasattr(coffee_embedding, 'tolist') else list(coffee_embedding)
    matcha_embeddings = matcha_embedding.tolist() if hasattr(matcha_embedding, 'tolist') else list(matcha_embedding)

    user_data = user.model_dump()
    user_data["embeddings"] = {
        "coffee": coffee_embeddings,
        "matcha": matcha_embeddings,
    }

    data = supabase.table("users").insert(user_data).execute()
    return data.data[0]


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    """Get a user by ID."""
    data = supabase.table("users").select("*").eq("id", user_id).execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="User not found")
    return data.data[0]


@app.get("/users/{user_id}/liked-events", response_model=list[Event])
def get_liked_events(user_id: int, matcha_mode: Optional[bool] = None):
    """Get all liked events for a user, optionally filtered by mode."""
    # Get user's liked_events list
    user_data = supabase.table("users").select("liked_events").eq("id", user_id).execute()
    if not user_data.data:
        raise HTTPException(status_code=404, detail="User not found")

    liked_event_ids = user_data.data[0].get("liked_events") or []
    if not liked_event_ids:
        return []

    # Fetch the actual events
    query = supabase.table("events").select("*").in_("id", liked_event_ids)
    if matcha_mode is not None:
        query = query.eq("matcha_mode", matcha_mode)
    events_data = query.execute()

    return events_data.data


# Analytics
@app.get("/users/{user_id}/analytics", response_model=Dashboard)
def get_user_analytics(user_id: int, matcha_mode: Optional[bool] = None):
    """Get analytics for a user, optionally filtered by mode."""
    # Get user data
    user_data = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_data.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = User(**user_data.data[0])
    
    # Get analytics data
    query = supabase.table("analytics").select("*").eq("user_id", user_id)
    if matcha_mode is not None:
        query = query.eq("matcha_mode", matcha_mode)
    data = query.execute()
    
    # Convert to Analytics objects
    analytics_list = [Analytics(**record) for record in data.data]
    
    # Generate dashboard using existing function
    dashboard_data = generate_dashboard(user_id, analytics_list, gemini_client)
    
    # Transform the data to match frontend expectations
    # Your analytics.py returns different field names than frontend expects
    coffee_transformed = {
        "total_swipes": dashboard_data.coffee["interactions"],
        "likes": dashboard_data.coffee["swipes_right"],
        "dislikes": dashboard_data.coffee["swipes_left"],
        "like_rate": dashboard_data.coffee["like_rate"],
        "avg_time_spent": dashboard_data.coffee["avg_time_per_interaction"],
        "total_time_spent": dashboard_data.coffee["time_spent_seconds"],
        "hesitation_score": dashboard_data.coffee["hesitation_score"],
    }
    
    matcha_transformed = {
        "total_swipes": dashboard_data.matcha["interactions"],
        "likes": dashboard_data.matcha["swipes_right"],
        "dislikes": dashboard_data.matcha["swipes_left"],
        "like_rate": dashboard_data.matcha["like_rate"],
        "avg_time_spent": dashboard_data.matcha["avg_time_per_interaction"],
        "total_time_spent": dashboard_data.matcha["time_spent_seconds"],
        "hesitation_score": dashboard_data.matcha["hesitation_score"],
    }
    
    # Return transformed dashboard
    return Dashboard(
        person=user,
        coffee=coffee_transformed,
        matcha=matcha_transformed,
        total_swipes=dashboard_data.total_swipes,
        overall_like_rate=dashboard_data.overall_like_rate,
        tags=dashboard_data.tags,
        ai_insights=dashboard_data.ai_insights,
    )
