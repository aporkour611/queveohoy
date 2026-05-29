import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public");

const REQUIRED_PNGS = [
  "deportes/futbol.png",
  "deportes/baloncesto.png",
  "deportes/baloncesto-nba.png",
  "deportes/tenis.png",
  "deportes/ciclismo.png",
  "deportes/copa-rey.png",
  "ciclismo/giro-italia.png",
  "ciclismo/tour-france.png",
  "ciclismo/vuelta-espana.png",
  "flagship/mundial-2026.png",
  "flagship/ufc-329.png",
  "flagship/ufc-ppv.png",
  "flagship/ufc-road.png",
  "flagship/roland-garros.png",
  "flagship/roland-garros-knockout.png",
  "esports/esports.png",
  "esports/cs2.png",
  "esports/valorant.png",
  "esports/lol.png",
  "motor/f1.png",
  "motor/motogp.png",
  "posters/velada-ibai.png",
  "posters/mobland-s2.png",
];

describe("portadas v1.0", () => {
  it("existen todos los PNG editoriales requeridos", () => {
    for (const rel of REQUIRED_PNGS) {
      const filePath = join(ROOT, rel);
      expect(existsSync(filePath), `missing ${rel}`).toBe(true);
      const header = readFileSync(filePath).subarray(0, 4);
      expect(Buffer.from(header).toString("hex")).toBe("89504e47");
    }
  });

  it("mantienen un tamaño razonable (< 120 KB)", () => {
    for (const rel of REQUIRED_PNGS) {
      const filePath = join(ROOT, rel);
      const size = readFileSync(filePath).byteLength;
      expect(size, `${rel} too large (${size} bytes)`).toBeLessThan(120 * 1024);
    }
  });
});
