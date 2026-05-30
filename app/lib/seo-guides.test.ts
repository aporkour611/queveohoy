import { describe, expect, it } from "vitest";
import { SEO_GUIDES, getSeoGuide } from "./seo-guides";

describe("seo-guides", () => {
  it("expone al menos 14 guías con contenido completo", () => {
    expect(SEO_GUIDES.length).toBeGreaterThanOrEqual(14);
    for (const guide of SEO_GUIDES) {
      expect(guide.slug.length).toBeGreaterThan(0);
      expect(guide.hubSlug.length).toBeGreaterThan(0);
      expect(guide.channels.length).toBeGreaterThan(0);
      expect(guide.tip.length).toBeGreaterThan(20);
    }
  });

  it("resuelve guías por slug", () => {
    expect(getSeoGuide("champions-espana")?.hubLabel).toBe("Champions");
    expect(getSeoGuide("inexistente")).toBeUndefined();
  });
});
