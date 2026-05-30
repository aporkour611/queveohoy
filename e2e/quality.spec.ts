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
