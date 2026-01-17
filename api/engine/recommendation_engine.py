"""Contains the general embedding functions that call and return embeddings.
Also contains similarity computation functions. Can be used for recommendation."""

from ml_models.embedding_toolbox import EmbeddingToolbox
from ml_models.gemini_client import GeminiClient
from analytics import aggregate_mode
from ..models import AnalyticsSwipe
from typing import Iterable

def _update_user_embedding(user_blurb: str, user_tags: list[str], EmbeddingToolbox: EmbeddingToolbox,
                          analytics_text: str, GeminiClient: GeminiClient) -> list[float]:
    """Updates the user embedding based on their blurb and tags."""
    adjusted_blurb = user_blurb + " " + " ".join([f"#{tag}" for tag in user_tags])
    adjusted_blurb = GeminiClient.augment_user_description(
        base_description=adjusted_blurb,
        analytics_text=analytics_text
    )
    user_embedding = EmbeddingToolbox.encode(adjusted_blurb, user_tags)
    return user_embedding.tolist()

def _get_top_events(user_embedding: list[float], event_embeddings_dict: dict[int, list[float]], 
                   seen: list[int], EmbeddingToolbox: EmbeddingToolbox, top_k: int) -> list[int]:
    """
    Given a user embedding and a list of event embeddings, return the top K
    most similar events based on cosine similarity.

    :param user_embedding: list embedding of the user
    :type user_embedding: list of float
    :param event_embeddings_dict: list of list embeddings for events
    :type event_embeddings_dict: dict of int to list of float
    :param top_k: number of top similar events to return
    :type top_k: int
    :return: list of top K most similar event ids
    :rtype: list of ints
    """
    similarities = []
    for key in event_embeddings_dict:
        if not isinstance(event_embeddings_dict[key], list):
            raise TypeError("event_embeddings_dict values must be list embeddings")
        
        if key in seen:
            continue
        else:
            compatability = EmbeddingToolbox.compute_similarity(
                EmbeddingToolbox.list_to_embedding(user_embedding),
                EmbeddingToolbox.list_to_embedding(event_embeddings_dict[key])
            )
            similarities.append((key, compatability))
    
    similarities.sort(key=lambda x: x[1], reverse=True)
    sorted_ids = [event_id for event_id, _ in similarities]
    return sorted[:top_k]

def recommend_events(event_embeddings_dict: dict[int, list[float]], seen: list[int], EmbeddingToolbox: EmbeddingToolbox, 
                     user_blurb: str, user_tags: list[str], GeminiClient: GeminiClient,
                     swipes: Iterable[AnalyticsSwipe], matcha_mode: bool, top_k=5) -> list[int]:
    """Recommends events to the user based on their embedding and event embeddings.
    USE THIS AS THE MAIN FUNCTION FOR RECOMMENDATION."""
    aggregate_mode_data = aggregate_mode(swipes, matcha_mode)
    user_embedding = _update_user_embedding(
        user_blurb=user_blurb,
        user_tags=user_tags,
        EmbeddingToolbox=EmbeddingToolbox,
        analytics_text=str(aggregate_mode_data),
        GeminiClient=GeminiClient
    )
    top_events = _get_top_events(
        user_embedding=user_embedding,
        event_embeddings_dict=event_embeddings_dict,
        seen=seen,
        EmbeddingToolbox=EmbeddingToolbox,
        top_k=top_k
    )
    return top_events