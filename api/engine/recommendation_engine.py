"""Contains the general embedding functions that call and return embeddings.
Also contains similarity computation functions. Can be used for recommendation."""

from typing import Iterable

import numpy as np
from engine.ml_models.embedding_toolbox import EmbeddingToolbox
from engine.ml_models.openai_client import OpenAIClient
from engine.analytics import aggregate_mode
from models import AnalyticsSwipe

def _update_user_embedding(user_blurb: str, user_tags: list[str], EmbeddingToolbox: EmbeddingToolbox,
                          analytics_text: str, OpenAIClient: OpenAIClient) -> list[float]:
    """Updates the user embedding based on their blurb and tags."""
    adjusted_blurb = user_blurb + " " + " ".join([f"#{tag}" for tag in user_tags])
    adjusted_blurb = OpenAIClient.augment_user_description(
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
    seen_ids = set(seen)
    candidates = [
        (event_id, embedding)
        for event_id, embedding in event_embeddings_dict.items()
        if event_id not in seen_ids
    ]
    if not candidates:
        return []

    event_ids, embeddings = zip(*candidates)
    if not all(isinstance(embedding, list) for embedding in embeddings):
        raise TypeError("event_embeddings_dict values must be list embeddings")

    user_vector = np.asarray(user_embedding, dtype=float)
    event_matrix = np.asarray(embeddings, dtype=float)
    similarities = event_matrix @ user_vector
    limit = min(top_k, len(event_ids))
    top_indexes = np.argpartition(similarities, -limit)[-limit:]
    top_indexes = top_indexes[np.argsort(similarities[top_indexes])[::-1]]
    return [event_ids[index] for index in top_indexes]

def recommend_events(event_embeddings_dict: dict[int, list[float]], seen: list[int], EmbeddingToolbox: EmbeddingToolbox, 
                     user_blurb: str, user_tags: list[str], OpenAIClient: OpenAIClient,
                     swipes: Iterable[AnalyticsSwipe], matcha_mode: bool, top_k=5) -> list[int]:
    """Recommends events to the user based on their embedding and event embeddings.
    USE THIS AS THE MAIN FUNCTION FOR RECOMMENDATION."""
    aggregate_mode_data = aggregate_mode(swipes, matcha_mode)
    user_embedding = _update_user_embedding(
        user_blurb=user_blurb,
        user_tags=user_tags,
        EmbeddingToolbox=EmbeddingToolbox,
        analytics_text=str(aggregate_mode_data),
        OpenAIClient=OpenAIClient
    )
    top_events = _get_top_events(
        user_embedding=user_embedding,
        event_embeddings_dict=event_embeddings_dict,
        seen=seen,
        EmbeddingToolbox=EmbeddingToolbox,
        top_k=top_k
    )
    return top_events
