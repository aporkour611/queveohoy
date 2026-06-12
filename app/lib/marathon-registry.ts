/**
 * Registro y planificación de maratones de desarrollo.
 * 1 maratón = 30 ciclos · ~0.29 versión patch (x.y1 → x.y30).
 */

export const CYCLES_PER_MARATHON = 30;
export const COMPLETED_MARATHONS = 9;
export const COMPLETED_CYCLES = 840;
export const FIRST_MARATHON_CYCLE = 1;

/** Maratón global #N (1-based). */
export function marathonCycleRange(marathonNumber: number) {
  if (marathonNumber < 1) throw new RangeError("marathonNumber >= 1");
  const cycleStart = FIRST_MARATHON_CYCLE + (marathonNumber - 1) * CYCLES_PER_MARATHON;
  return {
    marathon: marathonNumber,
    cycleStart,
    cycleEnd: cycleStart + CYCLES_PER_MARATHON - 1,
  };
}

/** Versión patch dentro de un bloque minor (p. ej. maratón 8 → 4.22–4.50). */
export function marathonVersionRange(marathonNumber: number, baseMajorMinor = "4.21") {
  const [major, minor] = baseMajorMinor.split(".").map(Number);

  if (marathonNumber === 8) {
    return {
      versionStart: `${major}.22.0`,
      versionEnd: `${major}.50.0`,
    };
  }

  const blockIndex = marathonNumber - 8;
  const blockMinor = minor + 1 + blockIndex * 3;
  return {
    versionStart: `${major}.${blockMinor}.0`,
    versionEnd: `${major}.${blockMinor + 2}.0`,
  };
}

/** Progresión de oleadas: 1 → +10 → +10 … hasta target. */
export function marathonWavePlan(targetMarathons = 1000) {
  const waves = [{ wave: 1, marathonsThisWave: 1, cumulative: 1 }];
  let cumulative = 1;

  while (cumulative < targetMarathons) {
    const next = Math.min(10, targetMarathons - cumulative);
    cumulative += next;
    waves.push({
      wave: waves.length + 1,
      marathonsThisWave: next,
      cumulative,
    });
  }

  return waves;
}

/** Genera metadatos para maratones [from..to] inclusive. */
export function generateMarathonIndex(fromMarathon: number, toMarathon: number) {
  const entries = [];
  for (let m = fromMarathon; m <= toMarathon; m++) {
    const { cycleStart, cycleEnd } = marathonCycleRange(m);
    const versions =
      m >= 8
        ? marathonVersionRange(m)
        : { versionStart: "—", versionEnd: "—" };
    entries.push({
      marathon: m,
      cycleStart,
      cycleEnd,
      ...versions,
      theme:
        m === 8
          ? "quality-95-phase-2"
          : m <= 100
            ? "quality-95-sustain"
            : m <= 1000
              ? "platform-scale"
              : "platform-scale-2",
      status: m <= COMPLETED_MARATHONS ? "completed" : m === 10 ? "active" : "planned",
    });
  }
  return entries;
}

/** Oleadas hasta 1000 maratones y luego hasta 2000. */
export function fullMarathonProgram() {
  return {
    wavesTo1000: marathonWavePlan(1000),
    wavesTo2000: marathonWavePlan(2000),
    totalMarathons: 2000,
    totalCycles: 2000 * CYCLES_PER_MARATHON,
    completed: { marathons: COMPLETED_MARATHONS, cycles: COMPLETED_CYCLES },
  };
}
