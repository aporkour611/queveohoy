import { describe, expect, it } from "vitest";
import { tokyoBroadcastToMadrid } from "./jikan-anime";
import { encodeJikanSource, parseJikanPoster } from "./jikan-client";

describe("tokyoBroadcastToMadrid", () => {
  it("convierte lunes 22:00 JST a hora de Madrid", () => {
    const result = tokyoBroadcastToMadrid("2026-05-25", "22:00");

    expect(result.date).toBe("2026-05-25");
    expect(result.time).toMatch(/^\d{2}:\d{2}$/);
    expect(result.time).not.toBe("22:00");
  });
});

describe("jikan poster source", () => {
  it("codifica y parsea póster MAL", () => {
    const source = encodeJikanSource(
      "https://cdn.myanimelist.net/images/anime/1/1.jpg",
      42
    );

    expect(parseJikanPoster(source, "poster")).toContain("l.jpg");
    expect(parseJikanPoster(source, "thumb")).toContain("t.jpg");
  });
});
