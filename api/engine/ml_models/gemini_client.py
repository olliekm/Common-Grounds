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

    def generate_user_encouragement(self, coffee: dict, matcha: dict, tags: dict, total_swipes: int) -> str:
        """
        Generate an encouraging AI summary for the user based on their overall engagement.
        Returns a single encouraging message string.
        """
        top_tags_text = ""
        if tags.get("top_tags"):
            top_tags_list = ", ".join([tag[0] for tag in tags["top_tags"][:3]])
            top_tags_text = f"Your top interests include: {top_tags_list}."

        prompt = f"""
You are a friendly coach analyzing a user's activity on a coffee/matcha matching platform.

User Activity Summary:
- Total events explored: {total_swipes}
- Coffee mode (professional): {coffee['interactions']} interactions, {coffee['like_rate']:.0%} liked
- Matcha mode (hobbies/fun): {matcha['interactions']} interactions, {matcha['like_rate']:.0%} liked
{top_tags_text}

Task:
Write a warm, encouraging 2-3 sentence summary that:
1. Celebrates their engagement and activity
2. Highlights what they seem to enjoy (modes/interests)
3. Motivates them to keep exploring

Tone: Friendly, positive, personalized. Return plain text only.
"""
        response = self.generate_content(prompt)
        return response.text.strip()

    def extract_recent_interests(self, recent_events: list[dict]) -> str:
        """
        Analyze the last 5 seen events and extract emerging interest patterns.
        Returns a brief, 3 sentence text summary for topic modeling/recommendation updates.
        
        :param recent_events: List of dicts with 'title', 'tags', 'liked', 'mode' keys
        """
        if not recent_events:
            return "No recent activity to analyze."

        events_summary = "\n".join([
            f"- {e.get('title', 'Untitled')} ({e.get('mode', 'unknown')} mode) | Liked: {e.get('liked', False)} | Tags: {', '.join(e.get('tags', []))}"
            for e in recent_events[:5]
        ])

        prompt = f"""
You are analyzing a user's most recent event interactions to update their recommendation profile.

Recent 5 events:
{events_summary}

Task:
Identify emerging interest patterns and themes from these recent interactions.
Focus on:
1. Which topics/tags are getting attention
2. Mode preferences (coffee vs matcha)
3. Shift in interests compared to random baseline

Output: 2-3 sentences capturing the user's current interest trajectory.
Be specific about topics. Return plain text only.
"""
        response = self.generate_content(prompt)
        return response.text.strip()