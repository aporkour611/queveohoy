import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  it("permite solicitudes dentro del límite", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000)).toEqual({ ok: true });
    expect(checkRateLimit(key, 2, 60_000)).toEqual({ ok: true });
  });

  it("bloquea cuando se supera el límite", () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, 1, 60_000);
    const blocked = checkRateLimit(key, 1, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
