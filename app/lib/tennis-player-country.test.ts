import { describe, expect, it } from "vitest";
import {
  normalizeTennisPlayerName,
  resolveTennisPlayerCountry,
  tennisFlagUrl,
} from "./tennis-player-country";

describe("tennis-player-country", () => {
  it("normaliza acentos y espacios", () => {
    expect(normalizeTennisPlayerName("  Jannik Sinner  ")).toBe("jannik sinner");
    expect(normalizeTennisPlayerName("Carlos Alcaraz (ESP)")).toBe(
      "carlos alcaraz"
    );
  });

  it("resuelve jugadores conocidos de Roland Garros", () => {
    expect(resolveTennisPlayerCountry("Jannik Sinner")).toBe("it");
    expect(resolveTennisPlayerCountry("Carlos Alcaraz")).toBe("es");
    expect(resolveTennisPlayerCountry("Novak Djokovic")).toBe("rs");
    expect(resolveTennisPlayerCountry("Alex de Minaur")).toBe("au");
    expect(resolveTennisPlayerCountry("Alexander Blockx")).toBe("be");
  });

  it("resuelve por apellido cuando no hay match exacto", () => {
    expect(resolveTennisPlayerCountry("C. Alcaraz")).toBe("es");
    expect(resolveTennisPlayerCountry("Paula Badosa")).toBe("es");
  });

  it("usa fallback tierra batida para jugadores desconocidos", () => {
    expect(resolveTennisPlayerCountry("Unknown Player")).toBe("clay");
    expect(resolveTennisPlayerCountry("")).toBe("clay");
  });

  it("genera URL de bandera para códigos ISO", () => {
    expect(tennisFlagUrl("es")).toBe("https://flagcdn.com/w640/es.png");
    expect(tennisFlagUrl("clay")).toBeNull();
  });
});
