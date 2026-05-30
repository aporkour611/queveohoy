import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("a11y landmarks", () => {
  test("home tiene main-content y skip target", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#main-content")).toBeVisible()
  })

  test("404 expone main-content", async ({ page }) => {
    await page.goto("/ruta-no-existe-a11y")
    await expect(page.locator("#main-content")).toBeVisible()
  })

  test("guía expone main-content", async ({ page }) => {
    await page.goto("/guia/champions-espana")
    await expect(page.locator("#main-content")).toBeVisible()
  })

  test("hub champions expone main-content", async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto("/champions", { waitUntil: "domcontentloaded", timeout: 45_000 })
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15_000 })
  })

  test("login expone main-content", async ({ page }) => {
    await page.goto("/cuenta/login")
    await expect(page.locator("#main-content")).toBeVisible()
  })

  test("skip link apunta a main-content", async ({ page }) => {
    await page.goto("/")
    const skip = page.locator(".qvh-skip-link")
    await expect(skip).toHaveAttribute("href", "#main-content")
  })
})

test.describe("a11y axe", () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 })

  test("home sin violaciones críticas WCAG", async ({ page }) => {
    await page.goto("/")
    await page.locator("#main-content").waitFor({ state: "visible" })

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )
    expect(critical).toEqual([])
  })
})

test.describe("api quality", () => {
  test("v2 feed soporta ETag", async ({ request }) => {
    const first = await request.get("/api/v2/feed")
    expect(first.ok()).toBeTruthy()
    const etag = first.headers()["etag"]
    expect(etag).toBeTruthy()

    const cached = await request.get("/api/v2/feed", {
      headers: { "If-None-Match": etag ?? "" },
    })
    expect(cached.status()).toBe(304)
  })

  test("v1 events by id responde", async ({ request }) => {
    const feed = await request.get("/api/v1/feed?limit=1")
    const body = await feed.json()
    const id = body.events[0]?.id
    if (!id) {
      test.skip()
      return
    }

    const detail = await request.get(`/api/v1/events/${id}`)
    expect(detail.ok()).toBeTruthy()
    const event = await detail.json()
    expect(event.event?.id).toBe(id)
  })
})

test.describe("cuenta privada", () => {
  test("login noindex", async ({ page }) => {
    await page.goto("/cuenta/login")
    const robots = await page.locator('meta[name="robots"]').getAttribute("content")
    expect(robots).toMatch(/noindex/i)
  })
})
