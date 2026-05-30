import { describe, expect, it } from "vitest"
import { MAIN_CATEGORY_GROUPS, selectableSportIdsFromGroup } from "./filter-groups-design"

describe("rally launch", () => {
  it("rally tile is active in motor group", () => {
    const motor = MAIN_CATEGORY_GROUPS.find((g) => g.id === "motor")
    const rally = motor?.subgroups.find((s) => s.sportId === "rally")
    expect(rally?.disabled).toBeFalsy()
    expect(selectableSportIdsFromGroup("motor")).toContain("rally")
  })
})
