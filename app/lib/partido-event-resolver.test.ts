import { describe, expect, it } from "vitest";
import { eventSlug, partidoPath } from "./event-slug";
import { resolveEventBySlugFromPool } from "./partido-event-resolver";
import { UFC_CASABLANCA_FALLBACK } from "./ufc-week";
import { CHAMPIONS_FINAL_FALLBACK } from "./champions-week";

describe("resolveEventBySlugFromPool", () => {
  it("resuelve Topuria vs Gaethje editorial sin fila en BD", () => {
    const event = UFC_CASABLANCA_FALLBACK.event;
    const slug = eventSlug(event);

    expect(slug).toBe("2026-06-15-ilia-topuria-vs-justin-gaethje");
    expect(resolveEventBySlugFromPool([], slug, "2026-06-15")).toEqual(event);
    expect(partidoPath(event)).toBe(`/partido/${slug}`);
  });

  it("resuelve final Champions editorial", () => {
    const event = CHAMPIONS_FINAL_FALLBACK.event;
    const slug = eventSlug(event);

    expect(resolveEventBySlugFromPool([], slug, event.date!)).toEqual(event);
  });

  it("prioriza evento de BD sobre editorial con mismo slug", () => {
    const editorial = UFC_CASABLANCA_FALLBACK.event;
    const slug = eventSlug(editorial);
    const fromDb = { ...editorial, id: 42, platform: "DAZN" };

    expect(resolveEventBySlugFromPool([fromDb], slug, "2026-06-15")?.id).toBe(42);
  });
});
