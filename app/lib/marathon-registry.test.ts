import { describe, expect, it } from "vitest";
import {
  CYCLES_PER_MARATHON,
  COMPLETED_MARATHONS,
  generateMarathonIndex,
  marathonCycleRange,
  marathonWavePlan,
  fullMarathonProgram,
} from "./marathon-registry";

describe("marathon-registry", () => {
  it("maratón 8 = ciclos 211–240", () => {
    const range = marathonCycleRange(8);
    expect(range.cycleStart).toBe(211);
    expect(range.cycleEnd).toBe(240);
  });

  it("30 ciclos por maratón", () => {
    const r = marathonCycleRange(10);
    expect(r.cycleEnd - r.cycleStart + 1).toBe(CYCLES_PER_MARATHON);
  });

  it("oleadas 1→11→21… hasta 1000", () => {
    const waves = marathonWavePlan(1000);
    expect(waves[0].cumulative).toBe(1);
    expect(waves[1].cumulative).toBe(11);
    expect(waves[2].cumulative).toBe(21);
    expect(waves[waves.length - 1].cumulative).toBe(1000);
  });

  it("programa completo 2000 maratones", () => {
    const program = fullMarathonProgram();
    expect(program.totalMarathons).toBe(2000);
    expect(program.totalCycles).toBe(60000);
    expect(program.completed.marathons).toBe(COMPLETED_MARATHONS);
  });

  it("genera índice de maratones", () => {
    const slice = generateMarathonIndex(8, 10);
    expect(slice).toHaveLength(3);
    expect(slice[0].marathon).toBe(8);
    expect(slice[0].status).toBe("completed");
    expect(slice[1].status).toBe("active");
  });
});
