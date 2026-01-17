"""
Configuration module for API initialization including Gemini model setup.
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

from engine.ml_models.gemini_client import GeminiClient
from engine.ml_models.embedding_toolbox import EmbeddingToolbox

load_dotenv()

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model (using Flash model for speed/cost)
gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# Initialize GeminiClient
gemini_client = GeminiClient(gemini_model)

# How to use gemini_client
# from config import gemini_client
# from engine.analytics import generate_dashboard

# # Then pass it to generate_dashboard:
# dashboard = generate_dashboard(person, swipes, gemini_client)

# Initialize EmbeddingToolbox
embedding_toolbox = EmbeddingToolbox()
embedding_toolbox.instantiate()

# How to use embedding toolbox
# from config import embedding_toolbox

# # Use it for encoding:
# embedding = embedding_toolbox.encode("some text")
# similarity = embedding_toolbox.compute_similarity(emb1, emb2)
