import { afterEach, describe, expect, it, vi } from "vitest";
import { getMadridTodayKey, isPastSeoDate } from "./seo-date";

describe("seo-date", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marca fechas anteriores a hoy en Madrid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T10:00:00.000Z"));

    expect(isPastSeoDate("2026-05-26")).toBe(true);
    expect(isPastSeoDate(getMadridTodayKey())).toBe(false);
    expect(isPastSeoDate("2026-05-28")).toBe(false);
  });
});
