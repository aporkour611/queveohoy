import { describe, expect, it } from "vitest";
import { normalizePageFindQuery } from "./page-find";

describe("normalizePageFindQuery", () => {
  it("recorta y pasa a minúsculas", () => {
    expect(normalizePageFindQuery("  Champions  ")).toBe("champions");
  });

  it("devuelve cadena vacía si solo hay espacios", () => {
    expect(normalizePageFindQuery("   ")).toBe("");
  });
});
