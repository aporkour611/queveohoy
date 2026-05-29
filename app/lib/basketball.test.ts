import { describe, expect, it } from "vitest";
import {
  encodeBasketSource,
  nbaAbbrFromTeamName,
  parseBasketTeamLogos,
} from "./basketball";

describe("basketball logos", () => {
  it("codifica y parsea abreviaturas NBA", () => {
    const source = encodeBasketSource("LAL", "BOS");
    expect(source).toBe("bdl-logos:LAL::BOS");

    const logos = parseBasketTeamLogos(source);
    expect(logos?.homeAbbr).toBe("LAL");
    expect(logos?.awayAbbr).toBe("BOS");
    expect(logos?.homeUrl).toContain("lal.png");
    expect(logos?.awayUrl).toContain("bos.png");
  });

  it("resuelve legacy bdl con nombres completos", () => {
    const logos = parseBasketTeamLogos("bdl:Los Angeles Lakers:Boston Celtics");
    expect(logos?.homeAbbr).toBe("LAL");
    expect(logos?.awayAbbr).toBe("BOS");
  });

  it("resuelve abreviaturas desde home/away cuando falta source", () => {
    const logos = parseBasketTeamLogos(null, "Miami Heat", "Chicago Bulls");
    expect(logos?.homeAbbr).toBe("MIA");
    expect(logos?.awayAbbr).toBe("CHI");
  });

  it("mapea nombres NBA conocidos", () => {
    expect(nbaAbbrFromTeamName("Golden State Warriors")).toBe("GSW");
    expect(nbaAbbrFromTeamName("New York Knicks")).toBe("NYK");
  });
});
