"""Small caching and timing helpers for API benchmarks."""

from __future__ import annotations

import hashlib
import json
import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Any, Iterator

from cachetools import TTLCache


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


EVENT_CACHE_TTL_SECONDS = _env_int("EVENT_CACHE_TTL_SECONDS", 60)
RECOMMENDATION_CACHE_TTL_SECONDS = _env_int("RECOMMENDATION_CACHE_TTL_SECONDS", 30)
EVENT_CACHE_MAXSIZE = _env_int("EVENT_CACHE_MAXSIZE", 32)
RECOMMENDATION_CACHE_MAXSIZE = _env_int("RECOMMENDATION_CACHE_MAXSIZE", 256)

events_cache = TTLCache(maxsize=EVENT_CACHE_MAXSIZE, ttl=EVENT_CACHE_TTL_SECONDS)
recommendations_cache = TTLCache(
    maxsize=RECOMMENDATION_CACHE_MAXSIZE,
    ttl=RECOMMENDATION_CACHE_TTL_SECONDS,
)


@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0

    def hit(self) -> None:
        self.hits += 1

    def miss(self) -> None:
        self.misses += 1

    def reset(self) -> None:
        self.hits = 0
        self.misses = 0

    @property
    def total(self) -> int:
        return self.hits + self.misses

    @property
    def hit_rate(self) -> float:
        return self.hits / self.total if self.total else 0.0

    def as_dict(self) -> dict[str, Any]:
        return {
            "hits": self.hits,
            "misses": self.misses,
            "total": self.total,
            "hit_rate": self.hit_rate,
        }


event_cache_stats = CacheStats()
recommendation_cache_stats = CacheStats()


@dataclass
class RequestMetrics:
    timings_ms: dict[str, float] = field(default_factory=dict)
    cache: dict[str, str] = field(default_factory=dict)
    counts: dict[str, int] = field(default_factory=dict)

    @contextmanager
    def track(self, name: str) -> Iterator[None]:
        start = time.perf_counter()
        try:
            yield
        finally:
            self.timings_ms[name] = round((time.perf_counter() - start) * 1000, 2)


def stable_hash(value: Any) -> str:
    """Create a short deterministic hash for cache keys and metric labels."""
    payload = json.dumps(value, sort_keys=True, default=str, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def cache_snapshot() -> dict[str, Any]:
    return {
        "events": {
            "items": len(events_cache),
            "maxsize": EVENT_CACHE_MAXSIZE,
            "ttl_seconds": EVENT_CACHE_TTL_SECONDS,
            **event_cache_stats.as_dict(),
        },
        "recommendations": {
            "items": len(recommendations_cache),
            "maxsize": RECOMMENDATION_CACHE_MAXSIZE,
            "ttl_seconds": RECOMMENDATION_CACHE_TTL_SECONDS,
            **recommendation_cache_stats.as_dict(),
        },
    }


def reset_cache_stats() -> None:
    event_cache_stats.reset()
    recommendation_cache_stats.reset()


def clear_response_caches(reset_stats: bool = False) -> None:
    events_cache.clear()
    recommendations_cache.clear()
    if reset_stats:
        reset_cache_stats()
