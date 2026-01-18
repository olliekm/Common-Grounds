import os
from openai import OpenAI

class OpenAIClient:
    def __init__(self):
        """
        Initialize OpenAI client using API key from environment.
        """
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"  # Fast and cheap model

    def generate_content(self, prompt: str) -> str:
        """
        Calls OpenAI to generate content based on the prompt.

        :param prompt: prompt to send to OpenAI
        :type prompt: str
        :return: response text from OpenAI
        :rtype: str
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content

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
You are a friendly coach and coffee/matcha mascot analyzing a user's activity on a experience matching platform.

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
        return response.strip()

    def augment_user_description(self, base_description: str, analytics_text: str) -> str:
        """
        Augment user description with analytics insights for better recommendations.

        :param base_description: User's blurb + tags combined
        :param analytics_text: String representation of user's swipe analytics
        :return: Augmented description for embedding
        """
        if not analytics_text or analytics_text == "{'mode': True, 'time_spent_seconds': 0, 'swipes_right': 0, 'swipes_left': 0, 'interactions': 0, 'avg_time_per_interaction': 0.0, 'like_rate': 0.0, 'hesitation_score': 0.0}" or analytics_text == "{'mode': False, 'time_spent_seconds': 0, 'swipes_right': 0, 'swipes_left': 0, 'interactions': 0, 'avg_time_per_interaction': 0.0, 'like_rate': 0.0, 'hesitation_score': 0.0}":
            # No analytics data yet, return base description as-is
            return base_description

        prompt = f"""
You are helping personalize event recommendations. Given a user's profile description and their recent activity analytics, create an enhanced description that captures their interests.

User Profile:
{base_description}

Recent Activity Analytics:
{analytics_text}

Task:
Create a brief, enhanced description (2-3 sentences max) that combines the user's stated interests with patterns from their behavior. Focus on specific topics and themes they seem drawn to. Return plain text only, no formatting.
"""
        try:
            response = self.generate_content(prompt)
            return response.strip()
        except Exception as e:
            print(f"OpenAI augmentation failed: {e}")
            return base_description

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
        return response.strip()
