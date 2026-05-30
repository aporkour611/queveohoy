import { describe, expect, it } from "vitest";
import {
  MAIN_CATEGORY_GROUPS,
  isMainGroupFullySelected,
  selectableSportIdsFromGroup,
} from "./filter-groups-design";

describe("MAIN_CATEGORY_GROUPS", () => {
  it("define cinco grupos principales", () => {
    expect(MAIN_CATEGORY_GROUPS).toHaveLength(5);
    expect(MAIN_CATEGORY_GROUPS.map((g) => g.id)).toEqual([
      "deportes",
      "motor",
      "esports",
      "tv",
      "cine",
    ]);
  });

  it("marca rally como no seleccionable", () => {
    const motor = MAIN_CATEGORY_GROUPS.find((g) => g.id === "motor");
    const rally = motor?.subgroups.find((s) => s.sportId === "rally");
    expect(rally?.disabled).toBe(true);
    expect(selectableSportIdsFromGroup("motor")).toEqual(["formula1", "motos"]);
  });

  it("detecta grupo completo seleccionado", () => {
    const selected = new Set(["futbol", "tenis", "basket", "ciclismo", "ufc"]);
    expect(isMainGroupFullySelected("deportes", selected)).toBe(true);
    expect(isMainGroupFullySelected("motor", selected)).toBe(false);
  });
});
