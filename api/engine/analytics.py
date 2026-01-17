"""
Analytics helpers for coffee/matcha modes.

This module aggregates swipe-level data (`AnalyticsSwipe`) into dashboard-ready
metrics and produces lightweight AI-style insights without requiring an LLM.
"""

from __future__ import annotations

from collections import Counter
from datetime import timedelta
from typing import Iterable, List, Dict, Any

from .models import (
	AnalyticsPerson,
	AnalyticsSwipe,
	Dashboard,
	EventSide,
	SwipeDirection,
)


def _safe_div(numerator: float, denominator: float) -> float:
	return numerator / denominator if denominator else 0.0


def _aggregate_mode(swipes: Iterable[AnalyticsSwipe], mode: EventSide) -> Dict[str, Any]:
	swipes_list = [s for s in swipes if _mode_of_swipe(s) == mode]
	time_spent_seconds = sum(_seconds(s.time_spent) for s in swipes_list)
	swipes_right = sum(1 for s in swipes_list if s.liked)
	swipes_left = sum(1 for s in swipes_list if not s.liked)
	interactions = len(swipes_list)
	avg_time = _safe_div(time_spent_seconds, interactions)
	like_rate = _safe_div(swipes_right, interactions)

	return {
		"mode": mode,
		"time_spent_seconds": time_spent_seconds,
		"swipes_right": swipes_right,
		"swipes_left": swipes_left,
		"interactions": interactions,
		"avg_time_per_interaction": avg_time,
		"like_rate": like_rate,
	}


def _mode_of_swipe(swipe: AnalyticsSwipe) -> EventSide:
	return EventSide.matcha if swipe.matcha_mode else EventSide.coffee


def _seconds(value: timedelta | None) -> float:
	if value is None:
		return 0.0
	if isinstance(value, timedelta):
		return value.total_seconds()
	return 0.0


def _tag_breakdown(swipes: Iterable[AnalyticsSwipe]) -> Dict[str, Any]:
	counter: Counter[str] = Counter()
	tagged_swipes = 0
	for swipe in swipes:
		if not swipe.tags:
			continue
		tagged_swipes += 1
		counter.update(tag.strip().lower() for tag in swipe.tags if tag.strip())

	top_tags = counter.most_common(5)
	return {"top_tags": top_tags, "total_tagged_swipes": tagged_swipes}


def generate_dashboard(person: AnalyticsPerson, swipes: List[AnalyticsSwipe]) -> Dashboard:
	"""Aggregate raw swipes into a dashboard-friendly snapshot."""

	coffee_metrics = _aggregate_mode(swipes, EventSide.coffee)
	matcha_metrics = _aggregate_mode(swipes, EventSide.matcha)

	total_swipes = coffee_metrics["interactions"] + matcha_metrics["interactions"]
	overall_like_rate = _safe_div(
		coffee_metrics["swipes_right"] + matcha_metrics["swipes_right"],
		total_swipes,
	)

	tags = _tag_breakdown(swipes)
	ai_insights = _ai_insights(coffee_metrics, matcha_metrics, tags, total_swipes)

	# Keep person counters in sync with aggregated values.
	person_updated = person.copy(update={
		"coffee_time": coffee_metrics["time_spent_seconds"],
		"coffee_interactions": coffee_metrics["interactions"],
		"matcha_time": matcha_metrics["time_spent_seconds"],
		"matcha_interactions": matcha_metrics["interactions"],
	})

	return Dashboard(
		person=person_updated,
		coffee=coffee_metrics,
		matcha=matcha_metrics,
		total_swipes=total_swipes,
		overall_like_rate=overall_like_rate,
		tags=tags,
		ai_insights=ai_insights,
	)


# def _ai_insights(
# 	coffee: Dict[str, Any],
# 	matcha: Dict[str, Any],
# 	tags: Dict[str, Any],
# 	total_swipes: int,
# ) -> List[str]:
# 	"""Heuristic insights; replace with an LLM call if desired."""

# 	insights: List[str] = []

# 	if coffee["like_rate"] > matcha["like_rate"] + 0.15:
# 		insights.append(
# 			f"Users prefer coffee-mode content by {(coffee['like_rate'] - matcha['like_rate']):.0%}."
# 		)
# 	elif matcha["like_rate"] > coffee["like_rate"] + 0.15:
# 		insights.append(
# 			f"Users prefer matcha-mode content by {(matcha['like_rate'] - coffee['like_rate']):.0%}."
# 		)

# 	if coffee["avg_time_per_interaction"] < 2 and coffee["like_rate"] > 0.6:
# 		insights.append("Coffee-mode decisions are quick and positive—surface more premium matches early.")
# 	if matcha["avg_time_per_interaction"] > 5 and matcha["like_rate"] < 0.35:
# 		insights.append("Matcha-mode users hesitate but rarely like—consider simplifying card info or visuals.")

# 	if total_swipes and tags.get("top_tags"):
# 		top_tag, count = tags["top_tags"][0]
# 		share = count / total_swipes
# 		insights.append(f"Tag '{top_tag}' drives {share:.0%} of engagement; expand this theme.")

# 	if not insights:
# 		insights.append("Engagement is balanced; continue A/B testing layouts and content density.")

# 	return insights


def swipe_direction(swipe: AnalyticsSwipe) -> SwipeDirection:
	"""Map `liked` to a SwipeDirection for UI usage."""

	return SwipeDirection.right if swipe.liked else SwipeDirection.left
