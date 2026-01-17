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

    def encode(self, text: str) -> np.ndarray:
        """
        Encodes the text
        
        :param text: text of what needs to be encoded
        :type text: str
        :return: np.ndarray embedding of the text
        :rtype: ndarray
        """
        if not isinstance(text, str):
            raise TypeError("encode expects a single string")
        
        embedding = self.model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
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