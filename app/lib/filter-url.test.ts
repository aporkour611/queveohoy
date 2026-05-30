import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { buildFilterParam, syncFilterParamInUrl } from "./filter-url"

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
