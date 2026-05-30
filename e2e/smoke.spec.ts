import { expect, test } from "@playwright/test"

test.describe("smoke", () => {
  test("home carga el título principal", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Qué ver hoy/i)
    await expect(page.locator("body")).toBeVisible()
  })

  test("página de desarrolladores documenta la API", async ({ page }) => {
    await page.goto("/desarrolladores")
    await expect(page.getByRole("heading", { name: "Desarrolladores" })).toBeVisible()
    await expect(page.getByText("/api/v1/feed")).toBeVisible()
  })

  test("API v1 feed responde JSON", async ({ request }) => {
    const response = await request.get("/api/v1/feed")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.version).toBe("1")
    expect(Array.isArray(body.events)).toBeTruthy()
    expect(response.headers()["access-control-allow-origin"]).toBe("*")
  })

  test("API v1 search responde JSON", async ({ request }) => {
    const response = await request.get("/api/v1/search?q=real&limit=5")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.version).toBe("1")
    expect(body.query).toBe("real")
    expect(Array.isArray(body.events)).toBeTruthy()
  })

  test("API v1 feed pagina con cursor", async ({ request }) => {
    const first = await request.get("/api/v1/feed?limit=2")
    expect(first.ok()).toBeTruthy()
    const page = await first.json()
    expect(page.events.length).toBeLessThanOrEqual(2)
    if (page.nextCursor) {
      const second = await request.get(
        `/api/v1/feed?limit=2&cursor=${page.nextCursor}`
      )
      expect(second.ok()).toBeTruthy()
      const next = await second.json()
      expect(next.events[0]?.id).not.toBe(page.events[0]?.id)
    }
  })

  test("widget embed carga sin error", async ({ page }) => {
    await page.goto("/embed/esta-noche")
    await expect(page.getByText("Esta noche")).toBeVisible()
    await expect(page.getByRole("link", { name: /queveohoy\.es/i })).toBeVisible()
  })

  test("login muestra Google y magic link", async ({ page }) => {
    await page.goto("/cuenta/login")
    await expect(
      page.getByRole("button", { name: "Continuar con Google" })
    ).toBeVisible()
    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
  })
})
