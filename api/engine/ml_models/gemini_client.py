from google import genai

class GeminiClient:
    def __init__(self):
        """
        model: initialized Gemini Flash client

        :param model: contains key for Gemini access
        :type model: str
        """
        self.model = genai.Client()

    def generate_content(self, prompt: str):
        """
        Calls Gemini to generate content based on the prompt.

        :param prompt: prompt to send to Gemini
        :type prompt: str
        :return: response from Gemini
        :rtype: object
        """
        response = self.model.models.generate_content(
            model="gemini-2.5-flash-lite", 
            contents=prompt
        )
        return response

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