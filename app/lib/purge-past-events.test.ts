import { describe, expect, it } from "vitest";
import { isPastEventDate, todayMadridDateKey } from "./purge-past-events";

describe("isPastEventDate", () => {
  it("marca fechas anteriores a hoy en Madrid", () => {
    expect(isPastEventDate("2026-05-28", "2026-05-29")).toBe(true);
    expect(isPastEventDate("2026-05-29", "2026-05-29")).toBe(false);
    expect(isPastEventDate("2026-05-30", "2026-05-29")).toBe(false);
  });

  it("ignora fechas vacías", () => {
    expect(isPastEventDate(null, "2026-05-29")).toBe(false);
    expect(isPastEventDate("", "2026-05-29")).toBe(false);
  });
});

describe("todayMadridDateKey", () => {
  it("usa Europe/Madrid", () => {
    const key = todayMadridDateKey(new Date("2026-05-29T22:30:00Z"));
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
