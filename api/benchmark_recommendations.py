"""Benchmark the recommendation endpoint and export response/cache metrics."""

from __future__ import annotations

import argparse
import csv
import json
import statistics
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


METRIC_HEADERS = {
    "cache_events": "X-CG-Cache-Events",
    "cache_recommendations": "X-CG-Cache-Recommendations",
    "timing_user_db_ms": "X-CG-Timing-User-Db-Ms",
    "timing_events_db_ms": "X-CG-Timing-Events-Db-Ms",
    "timing_analytics_db_ms": "X-CG-Timing-Analytics-Db-Ms",
    "timing_recommend_ms": "X-CG-Timing-Recommend-Ms",
    "timing_total_ms": "X-CG-Timing-Total-Ms",
    "count_events": "X-CG-Count-Events",
    "count_results": "X-CG-Count-Results",
}

SCENARIOS = ("warm", "cold", "concurrent")


class BenchmarkConnectionError(RuntimeError):
    """Raised when the benchmark target API is not reachable."""


class BenchmarkDependencyError(RuntimeError):
    """Raised when the benchmark runner is missing a Python dependency."""


class BenchmarkHttpError(RuntimeError):
    """Raised when the benchmark target returns a non-success response."""


def _load_requests():
    try:
        import requests
    except ModuleNotFoundError as exc:
        raise BenchmarkDependencyError(
            "Missing Python dependency 'requests'. Install API dependencies first: "
            "pip install -r requirements.txt"
        ) from exc
    return requests


def _parse_header_value(value: str | None) -> Any:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return value


def _percentile(values: list[float], percentile: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    rank = (len(ordered) - 1) * percentile
    lower = int(rank)
    upper = min(lower + 1, len(ordered) - 1)
    weight = rank - lower
    return round(ordered[lower] + (ordered[upper] - ordered[lower]) * weight, 2)


def _connection_error(base_url: str, exc: Exception) -> BenchmarkConnectionError:
    parsed_url = urlparse(base_url)
    host = parsed_url.hostname or "127.0.0.1"
    port = parsed_url.port or (443 if parsed_url.scheme == "https" else 80)
    return BenchmarkConnectionError(
        f"Could not connect to {base_url}. Start the FastAPI server first, "
        f"for example: uvicorn main:app --reload --host {host} --port {port}"
    )


def _request_events(
    session: Any,
    requests_module: Any,
    base_url: str,
    user_id: int,
    matcha_mode: bool,
    limit: int,
    timeout: float,
) -> tuple[dict[str, Any], Exception | None]:
    url = f"{base_url.rstrip('/')}/events"
    started = time.perf_counter()
    try:
        response = session.get(
            url,
            params={
                "user_id": user_id,
                "matcha_mode": str(matcha_mode).lower(),
                "limit": limit,
            },
            timeout=timeout,
        )
    except requests_module.ConnectionError as exc:
        return (
            {
                "status_code": None,
                "client_elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
                "response_items": None,
                "error": str(_connection_error(base_url, exc)),
            },
            exc,
        )
    except requests_module.RequestException as exc:
        return (
            {
                "status_code": None,
                "client_elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
                "response_items": None,
                "error": str(exc),
            },
            exc,
        )

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    row: dict[str, Any] = {
        "status_code": response.status_code,
        "client_elapsed_ms": elapsed_ms,
        "response_items": None,
        "error": None,
    }
    for key, header in METRIC_HEADERS.items():
        row[key] = _parse_header_value(response.headers.get(header))

    if response.ok:
        row["response_items"] = len(response.json())
        return row, None

    body = response.text.strip()
    if len(body) > 500:
        body = f"{body[:500]}..."
    row["error"] = f"{response.status_code} from {response.url}. Response body: {body or '(empty)'}"
    return row, BenchmarkHttpError(row["error"])


def clear_remote_caches(
    session: Any,
    requests_module: Any,
    base_url: str,
    reset_stats: bool = False,
    timeout: float = 15,
) -> None:
    url = f"{base_url.rstrip('/')}/metrics/cache/clear"
    try:
        response = session.post(url, params={"reset_stats": str(reset_stats).lower()}, timeout=timeout)
        response.raise_for_status()
    except requests_module.ConnectionError as exc:
        raise _connection_error(base_url, exc) from exc
    except requests_module.RequestException as exc:
        raise BenchmarkHttpError(f"Could not clear caches via {url}: {exc}") from exc


def _run_sequential(
    scenario: str,
    base_url: str,
    user_id: int,
    matcha_mode: bool,
    limit: int,
    iterations: int,
    warmup: int,
    timeout: float,
    clear_before_each: bool,
) -> list[dict[str, Any]]:
    requests_module = _load_requests()
    rows = []
    total_requests = warmup + iterations

    with requests_module.Session() as session:
        clear_remote_caches(session, requests_module, base_url, reset_stats=True, timeout=timeout)
        measure_started = None
        for index in range(total_requests):
            phase = "warmup" if index < warmup else "measure"
            if phase == "measure" and measure_started is None:
                measure_started = time.perf_counter()
            if clear_before_each:
                clear_remote_caches(session, requests_module, base_url, timeout=timeout)
            row, error = _request_events(
                session=session,
                requests_module=requests_module,
                base_url=base_url,
                user_id=user_id,
                matcha_mode=matcha_mode,
                limit=limit,
                timeout=timeout,
            )
            row.update(
                {
                    "scenario": scenario,
                    "iteration": index - warmup + 1,
                    "phase": phase,
                    "concurrency": 1,
                }
            )
            rows.append(row)
            if error and phase == "warmup":
                raise error
        measure_elapsed_ms = (
            round((time.perf_counter() - measure_started) * 1000, 2)
            if measure_started is not None
            else 0
        )
        for row in rows:
            if row["phase"] == "measure":
                row["batch_elapsed_ms"] = measure_elapsed_ms

    return rows


def _run_concurrent(
    base_url: str,
    user_id: int,
    matcha_mode: bool,
    limit: int,
    iterations: int,
    warmup: int,
    concurrency: int,
    timeout: float,
) -> list[dict[str, Any]]:
    requests_module = _load_requests()
    rows = []
    scenario = "concurrent"

    with requests_module.Session() as session:
        clear_remote_caches(session, requests_module, base_url, reset_stats=True, timeout=timeout)
        for index in range(warmup):
            row, error = _request_events(
                session=session,
                requests_module=requests_module,
                base_url=base_url,
                user_id=user_id,
                matcha_mode=matcha_mode,
                limit=limit,
                timeout=timeout,
            )
            row.update(
                {
                    "scenario": scenario,
                    "iteration": index - warmup + 1,
                    "phase": "warmup",
                    "concurrency": 1,
                }
            )
            rows.append(row)
            if error:
                raise error

    def worker(index: int) -> dict[str, Any]:
        with requests_module.Session() as worker_session:
            row, _ = _request_events(
                session=worker_session,
                requests_module=requests_module,
                base_url=base_url,
                user_id=user_id,
                matcha_mode=matcha_mode,
                limit=limit,
                timeout=timeout,
            )
            row.update(
                {
                    "scenario": scenario,
                    "iteration": index,
                    "phase": "measure",
                    "concurrency": concurrency,
                }
            )
            return row

    batch_started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(worker, index + 1) for index in range(iterations)]
        for future in as_completed(futures):
            rows.append(future.result())
    batch_elapsed_ms = round((time.perf_counter() - batch_started) * 1000, 2)
    for row in rows:
        if row["phase"] == "measure":
            row["batch_elapsed_ms"] = batch_elapsed_ms

    return sorted(rows, key=lambda row: (row["phase"] != "warmup", row["iteration"]))


def run_benchmark(
    scenario: str,
    base_url: str,
    user_id: int,
    matcha_mode: bool,
    limit: int,
    iterations: int,
    warmup: int,
    concurrency: int,
    timeout: float,
) -> list[dict[str, Any]]:
    if scenario == "warm":
        return _run_sequential(
            scenario=scenario,
            base_url=base_url,
            user_id=user_id,
            matcha_mode=matcha_mode,
            limit=limit,
            iterations=iterations,
            warmup=warmup,
            timeout=timeout,
            clear_before_each=False,
        )
    if scenario == "cold":
        return _run_sequential(
            scenario=scenario,
            base_url=base_url,
            user_id=user_id,
            matcha_mode=matcha_mode,
            limit=limit,
            iterations=iterations,
            warmup=0,
            timeout=timeout,
            clear_before_each=True,
        )
    if scenario == "concurrent":
        return _run_concurrent(
            base_url=base_url,
            user_id=user_id,
            matcha_mode=matcha_mode,
            limit=limit,
            iterations=iterations,
            warmup=warmup,
            concurrency=concurrency,
            timeout=timeout,
        )
    raise ValueError(f"Unknown scenario: {scenario}")


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    measured = [row for row in rows if row["phase"] == "measure"]
    timings = [
        row["client_elapsed_ms"]
        for row in measured
        if row.get("client_elapsed_ms") is not None and not row.get("error")
    ]
    errors = [row for row in measured if row.get("error") or row.get("status_code", 0) >= 400]
    cache_hits = sum(
        1 for row in measured if row.get("cache_recommendations") == "hit"
    )
    wall_seconds = (measured[0].get("batch_elapsed_ms") or 0) / 1000 if measured else 0
    return {
        "scenario": measured[0]["scenario"] if measured else None,
        "requests": len(measured),
        "successful_requests": len(measured) - len(errors),
        "failed_requests": len(errors),
        "error_rate": len(errors) / len(measured) if measured else 0,
        "throughput_rps": round(len(measured) / wall_seconds, 2) if wall_seconds else 0,
        "recommendation_cache_hit_rate": cache_hits / len(measured) if measured else 0,
        "client_elapsed_ms": {
            "min": min(timings) if timings else None,
            "p50": _percentile(timings, 0.50),
            "median": statistics.median(timings) if timings else None,
            "p95": _percentile(timings, 0.95),
            "mean": round(statistics.mean(timings), 2) if timings else None,
            "max": max(timings) if timings else None,
        },
    }


def write_csv(rows: list[dict[str, Any]], output_path: Path) -> None:
    fieldnames = sorted({key for row in rows for key in row.keys()})
    with output_path.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _selected_scenarios(value: str) -> list[str]:
    if value == "all":
        return list(SCENARIOS)
    return [value]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--user-id", type=int, required=True)
    parser.add_argument("--matcha-mode", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--iterations", type=int, default=25)
    parser.add_argument("--warmup", type=int, default=3)
    parser.add_argument("--scenario", choices=(*SCENARIOS, "all"), default="warm")
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--timeout", type=float, default=60)
    parser.add_argument("--json-out", type=Path)
    parser.add_argument("--csv-out", type=Path)
    args = parser.parse_args()

    if args.concurrency < 1:
        parser.error("--concurrency must be at least 1")
    if args.scenario in {"concurrent", "all"} and not 10 <= args.concurrency <= 50:
        parser.error("--concurrency must be between 10 and 50 for concurrent benchmarks")

    all_rows = []
    summaries = {}
    try:
        for scenario in _selected_scenarios(args.scenario):
            rows = run_benchmark(
                scenario=scenario,
                base_url=args.base_url,
                user_id=args.user_id,
                matcha_mode=args.matcha_mode,
                limit=args.limit,
                iterations=args.iterations,
                warmup=args.warmup,
                concurrency=args.concurrency,
                timeout=args.timeout,
            )
            all_rows.extend(rows)
            summaries[scenario] = summarize(rows)
    except (BenchmarkConnectionError, BenchmarkDependencyError, BenchmarkHttpError) as exc:
        print(f"Benchmark failed: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc

    result = {"summaries": summaries, "rows": all_rows}

    if args.json_out:
        args.json_out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    if args.csv_out:
        write_csv(all_rows, args.csv_out)

    print(json.dumps(result["summaries"], indent=2))


if __name__ == "__main__":
    main()
