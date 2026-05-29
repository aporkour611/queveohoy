import { describe, expect, it } from "vitest";
import {
  hasSpanishDisplayTitle,
  resolveSpanishDisplayTitle,
} from "./spanish-display-title";

describe("spanish-display-title", () => {
  it("rechaza títulos en CJK", () => {
    expect(hasSpanishDisplayTitle("总裁大人他有读心术")).toBe(false);
    expect(hasSpanishDisplayTitle("進撃の巨人")).toBe(false);
  });

  it("acepta títulos en latín", () => {
    expect(hasSpanishDisplayTitle("La casa de papel")).toBe(true);
    expect(hasSpanishDisplayTitle("Attack on Titan")).toBe(true);
  });

  it("resolveSpanishDisplayTitle devuelve null sin traducción latina", () => {
    expect(resolveSpanishDisplayTitle(["总裁大人他有读心术", null])).toBeNull();
    expect(resolveSpanishDisplayTitle([null, "Demon Slayer"])).toBe(
      "Demon Slayer"
    );
  });
});
