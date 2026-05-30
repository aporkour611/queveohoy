import { describe, expect, it } from "vitest"
import {
  buildFilterParam,
  buildFilterSearch,
  parseFilterParam,
} from "./filter-url"

describe("filter-url", () => {
  it("parses valid sport ids", () => {
    expect(parseFilterParam("futbol,tenis,basket")).toEqual([
      "futbol",
      "tenis",
      "basket",
    ])
  })

  it("drops unknown ids and dedupes", () => {
    expect(parseFilterParam("futbol,foo,futbol")).toEqual(["futbol"])
  })

  it("builds search string", () => {
    expect(buildFilterSearch(["formula1", "motos"])).toBe(
      "?filtros=formula1%2Cmotos"
    )
    expect(buildFilterSearch([])).toBe("")
  })

  it("builds param from ids", () => {
    expect(buildFilterParam(["cine", "series"])).toBe("cine,series")
    expect(buildFilterParam(["invalid"])).toBeNull()
  })
})
