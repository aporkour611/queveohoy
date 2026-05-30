import { describe, expect, it } from "vitest";
import {
  formatFilterSummary,
  formatMediaGroupLabel,
  sportCalendarLabel,
  sportLabel,
} from "./filter-config";

describe("formatMediaGroupLabel", () => {
  it("keeps full label when all media types are selected", () => {
    expect(formatMediaGroupLabel(["cine", "series", "anime"])).toBe(
      "Cine, series & anime"
    );
  });

  it("combines partial media selections with ampersand", () => {
    expect(formatMediaGroupLabel(["cine", "anime"])).toBe("Cine & anime");
    expect(formatMediaGroupLabel(["cine", "series"])).toBe("Cine & series");
    expect(formatMediaGroupLabel(["series", "anime"])).toBe("Series & anime");
  });

  it("uses single media label when only one is selected", () => {
    expect(formatMediaGroupLabel(["cine"])).toBe("Cine");
  });
});

describe("sportCalendarLabel", () => {
  it("keeps LoL in filters but uses full name in calendar blocks", () => {
    expect(sportLabel("lol")).toBe("LoL");
    expect(sportCalendarLabel("lol")).toBe("League of Legends");
  });

  it("falls back to filter labels for other sports", () => {
    expect(sportCalendarLabel("valorant")).toBe("Valorant");
  });
});

describe("formatFilterSummary", () => {
  it("groups media filters into one label", () => {
    expect(formatFilterSummary(["cine", "anime", "futbol"])).toBe(
      "Cine & anime, Fútbol"
    );
  });
});
