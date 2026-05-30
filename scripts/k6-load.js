import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE || "https://queveohoy.es";

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 15 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(99)<3000"],
  },
};

const paths = ["/", "/api/health", "/api/v2/feed", "/explorar"];

export default function () {
  const path = paths[Math.floor(Math.random() * paths.length)];
  const res = http.get(`${BASE}${path}`, {
    headers: { "User-Agent": "QueveoHoy-k6/1.0" },
  });
  check(res, {
    "status 2xx/3xx": (r) => r.status >= 200 && r.status < 400,
    "duration < 3s": (r) => r.timings.duration < 3000,
  });
  sleep(0.3);
}
