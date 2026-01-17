class GeminiClient:
    def __init__(self, model):
        """
        model: initialized Gemini Flash client

        :param model: contains key for Gemini access
        :type model: str
        """
        self.model = model

    def generate_content(self, prompt: str):
        """
        Calls Gemini to generate content based on the prompt.

        :param prompt: prompt to send to Gemini
        :type prompt: str
        :return: response from Gemini
        :rtype: object
        """
        response = self.model.generate_content(
            prompt=prompt,
            max_output_tokens=150,
            temperature=0.7,
            top_p=0.95,
        )
        return response

    def build_prompt(self, base_description: str, analytics_text: str) -> str:
        """
        Builds the prompt sent to Gemini.
        """
        return f"""
You are analyzing user behavior to infer evolving interests.

Base user description:
{base_description}

Recent analytics signals:
{analytics_text}

Task:
Generate a concise augmentation (1 sentences) that captures
the user's current interests, preferences, and intent.
Do NOT repeat the base description.
Do NOT add facts not supported by analytics.
Return plain text only.
"""

    def augment_user_description(self, base_description: str, analytics_text: str) -> str:
        """
        Calls Gemini and returns augmented user intent text.
        """
        prompt = self.build_prompt(base_description, analytics_text)

        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def analyze_analytics(self, analytic: dict) -> str:
        """
        Prompts Gemini to analyze an instance of an analytic event and return a concise summary.
        """
        