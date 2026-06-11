import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  buildFilterParam,
  buildWeekViewHomeUrl,
  buildWeekViewHomeUrlWithFilters,
  readWeekViewFromSearch,
  stripWeekViewFromSearch,
  syncFilterParamInUrl,
} from "./filter-url"

describe("buildWeekViewHomeUrl", () => {
  it("builds week deep link", () => {
    expect(buildWeekViewHomeUrl()).toBe("/?week=1")
  })

  it("reads week intent from search", () => {
    expect(readWeekViewFromSearch("?week=1")).toBe(true)
    expect(readWeekViewFromSearch("?week=0")).toBe(false)
    expect(readWeekViewFromSearch("")).toBe(false)
  })

  it("strips week param preserving other query keys", () => {
    expect(stripWeekViewFromSearch("?week=1&filtros=futbol")).toBe("filtros=futbol")
    expect(stripWeekViewFromSearch("?week=1")).toBe("")
  })

  it("combines week view with filters", () => {
    expect(buildWeekViewHomeUrlWithFilters(["futbol", "tenis"])).toBe(
      "/?filtros=futbol%2Ctenis&week=1"
    )
    expect(buildWeekViewHomeUrlWithFilters([])).toBe("/?week=1")
  })
})

describe("buildFilterParam", () => {
  it("drops unknown ids", () => {
    expect(buildFilterParam(["futbol", "invalido"])).toBe("futbol")
  })
})

describe("syncFilterParamInUrl", () => {
  const replaceState = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    replaceState.mockClear()
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost/",
        pathname: "/",
        search: "",
        hash: "",
      },
      history: { replaceState, state: null },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("debounces replaceState when toggling filters", () => {
    syncFilterParamInUrl(["futbol"])
    syncFilterParamInUrl(["futbol", "tenis"])
    expect(replaceState).not.toHaveBeenCalled()

    vi.advanceTimersByTime(280)
    expect(replaceState).toHaveBeenCalledTimes(1)
  })

  it("applies immediately when requested", () => {
    syncFilterParamInUrl(["ufc"], { immediate: true })
    expect(replaceState).toHaveBeenCalledTimes(1)
  })
})
