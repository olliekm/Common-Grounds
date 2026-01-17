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

    def _build_analytics_prompt(self, coffee: dict, matcha: dict, tags: dict, total_swipes: int) -> str:
        """
        Builds the prompt for Gemini to analyze dashboard metrics.
        """
        top_tags_text = ""
        if tags.get("top_tags"):
            top_tags_list = ", ".join([f"{tag[0]} ({tag[1]} swipes)" for tag in tags["top_tags"][:3]])
            top_tags_text = f"\nTop tags: {top_tags_list}"

        analytics_summary = f"""
Dashboard Summary:
- Total swipes: {total_swipes}
- Coffee mode: {coffee['interactions']} interactions, {coffee['like_rate']:.0%} like rate, {coffee['avg_time_per_interaction']:.1f}s avg time
- Matcha mode: {matcha['interactions']} interactions, {matcha['like_rate']:.0%} like rate, {matcha['avg_time_per_interaction']:.1f}s avg time{top_tags_text}
"""

        return f"""
You are an analytics expert analyzing user engagement data from a coffee/matcha matching platform.

{analytics_summary}

Task:
Generate 2-3 concise, actionable insights from this engagement data.
Focus on:
1. Mode preference trends
2. Interaction patterns and time spent
3. Top tag signals and recommendations

Provide insights as plain text in 3 sentences. Be specific and data-driven.
"""

    def analyze_analytics(self, coffee: dict, matcha: dict, tags: dict, total_swipes: int) -> list[str]:
        """
        Calls Gemini to generate AI insights from dashboard metrics.
        Returns a list of insight strings.
        """
        prompt = self._build_analytics_prompt(coffee, matcha, tags, total_swipes)
        response = self.generate_content(prompt)
        
        # Parse the response into individual insights
        text = response.text.strip()
        insights = [line.strip() for line in text.split("\n") if line.strip()]
        
        return insights if insights else ["Unable to generate insights at this time."]