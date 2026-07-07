import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:8000";
const userId = __ENV.USER_ID || "1";
const matchaMode = __ENV.MATCHA_MODE || "true";
const limit = __ENV.LIMIT || "5";
const vus = Number(__ENV.CONCURRENCY || "10");
const iterations = Number(__ENV.ITERATIONS || "100");

export const recommendationCacheHitRate = new Rate("recommendation_cache_hit_rate");
export const errorRate = new Rate("error_rate");

export const options = {
  vus,
  iterations,
  summaryTrendStats: ["min", "avg", "med", "p(50)", "p(95)", "max"],
};

export function setup() {
  http.post(`${baseUrl}/metrics/cache/clear?reset_stats=true`);
}

export default function () {
  const response = http.get(
    `${baseUrl}/events?user_id=${userId}&matcha_mode=${matchaMode}&limit=${limit}`,
  );
  const ok = check(response, {
    "status is 200": (res) => res.status === 200,
  });
  errorRate.add(!ok);
  const cacheHeader =
    response.headers["X-Cg-Cache-Recommendations"] ||
    response.headers["X-CG-Cache-Recommendations"] ||
    response.headers["x-cg-cache-recommendations"];
  recommendationCacheHitRate.add(cacheHeader === "hit");
}
