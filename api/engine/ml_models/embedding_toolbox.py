from sentence_transformers import SentenceTransformer
import numpy as np

"""
Embedding Toolbox using Sentence Transformers

Important to note, the model is instantiated separately to avoid heavy loading during import.
When using **REMEMBER TO CALL self.instantiate()** after creating an instance of the class.
"""
class EmbeddingToolbox:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model = model_name

    def instantiate(self):
        """
        Instantiating the actual model
        """
        self.model = SentenceTransformer(self.model)

    def encode(self, blurb: str, tags: list[str]) -> np.ndarray:
        """
        Encodes the text
        
        :param blurb: text of what needs to be encoded
        :type blurb: str
        :param tags: list of tags associated with the blurb
        :type tags: list of str
        :return: np.ndarray embedding of the text
        :rtype: ndarray
        """
        if not isinstance(blurb, str):
            raise TypeError("encode expects a single string")

        if not isinstance(tags, list):
            raise TypeError("encode expects a list of tags")

        new_text = blurb + " " + " ".join([f"#{tag}" for tag in tags])
        embedding = self.model.encode(new_text, convert_to_numpy=True, normalize_embeddings=True)
        return embedding
    
    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Computes cosine similarity between two embeddings
        
        :param emb1: embedding of first object
        :type emb1: ndarray
        :param emb2: embedding of second object
        :type emb2: ndarray
        :return: float similarity score
        :rtype: float
        """
        similarity = np.dot(emb1, emb2)
        return float(similarity)
    
    def embedding_to_list(self, embedding: np.ndarray) -> list:
        """
        Converts embedding ndarray to list for easier storage
        
        :param embedding: embedding ndarray
        :type embedding: ndarray
        :return: list representation of embedding
        :rtype: list
        """
        return embedding.tolist()
    
    def list_to_embedding(self, embedding_list: list) -> np.ndarray:
        """
        Converts list back to embedding ndarray
        
        :param embedding_list: list representation of embedding
        :type embedding_list: list
        :return: embedding ndarray
        :rtype: ndarray
        """
        return np.array(embedding_list)