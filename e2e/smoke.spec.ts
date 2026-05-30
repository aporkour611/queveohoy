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
    await expect(page.getByText("GET /api/v1/feed", { exact: true })).toBeVisible()
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
    await expect(
      page.getByRole("link", { name: "queveohoy.es", exact: true })
    ).toBeVisible()
  })

  test("login muestra Google y magic link", async ({ page }) => {
    await page.goto("/cuenta/login")
    await expect(
      page.getByRole("button", { name: "Continuar con Google" })
    ).toBeVisible()
    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
  })

  test("explorar muestra grupos neon", async ({ page }) => {
    await page.goto("/explorar")
    await expect(
      page.getByRole("heading", { name: "Explorar categorías" })
    ).toBeVisible()
    await expect(page.getByText("Grupos principales")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Ver en la agenda" })
    ).toBeVisible()
  })

  test("deep link filtros en home", async ({ page }) => {
    await page.goto("/?filtros=futbol")
    await expect(page.locator("body")).toBeVisible()
  })

  test("API health responde ok", async ({ request }) => {
    const response = await request.get("/api/health")
    const body = await response.json()
    expect(body.version).toBeTruthy()
    expect(body.checks).toBeTruthy()
    expect(body.ok).toBe(true)
    expect(response.status()).toBe(200)
  })

  test("API feed-meta responde JSON", async ({ request }) => {
    const response = await request.get("/api/feed-meta")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.generatedAt).toBeTruthy()
    expect(typeof body.eventCount).toBe("number")
  })

  test("API v1 feed filtra categories", async ({ request }) => {
    const response = await request.get(
      "/api/v1/feed?categories=futbol&limit=5"
    )
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.apiMinorVersion).toBe("1.1")
    expect(body.categoriesApplied).toContain("futbol")
  })

  test("widget categorías embed carga", async ({ page }) => {
    await page.goto("/embed/categorias")
    await expect(page.getByText("Explorar")).toBeVisible()
  })
})
