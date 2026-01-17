"""Contains the general embedding functions that call and return embeddings.
Also contains similarity computation functions. Can be used for recommendation."""

from ml_models.embedding_toolbox import EmbeddingToolbox
from ml_models.gemini_client import GeminiClient

def update_user_embedding(user_blurb: str, user_tags: list[str], EmbeddingToolbox: EmbeddingToolbox) -> list[float]:
    """Updates the user embedding based on their blurb and tags."""

def get_top_events(user_embedding: list[float], event_embeddings_dict: dict[int, list[float]], 
                   seen: list[int], EmbeddingToolbox: EmbeddingToolbox, top_k=5) -> list[int]:
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
    return similarities[:top_k]