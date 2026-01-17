"""
Configuration module for API initialization including Gemini model setup.
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

from engine.ml_models.gemini_client import GeminiClient

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


# How to use
# from config import gemini_client
# from engine.analytics import generate_dashboard

# # Then pass it to generate_dashboard:
# dashboard = generate_dashboard(person, swipes, gemini_client)