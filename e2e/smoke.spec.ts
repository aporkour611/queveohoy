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
    await expect(page.getByRole("heading", { name: "API pública (read-only)" })).toBeVisible()
  })

  test("API v1 feed responde JSON", async ({ request }) => {
    const response = await request.get("/api/v1/feed")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.version).toBe("1")
    expect(Array.isArray(body.events)).toBeTruthy()
    expect(response.headers()["access-control-allow-origin"]).toBe("*")
  })

  test("API v1 feed week responde JSON", async ({ request }) => {
    const response = await request.get("/api/v1/feed/week")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.version).toBe("1")
    expect(body.scope).toBe("week")
    expect(Array.isArray(body.events)).toBeTruthy()
  })

  test("explorar carga panel de categorías", async ({ page }) => {
    await page.goto("/explorar")
    await expect(page.getByRole("heading", { name: "Explorar categorías" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Ver en la agenda" })).toBeVisible()
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
    await expect(page.locator(".qvh-embed")).toBeVisible()
  })

  test("login muestra OAuth y magic link", async ({ page }) => {
    await page.goto("/cuenta/login")
    await expect(
      page.getByRole("button", { name: "Continuar con Google" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Continuar con Apple" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Continuar con Microsoft" })
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
    expect(typeof body.todayCount).toBe("number")
    expect(typeof body.weekCount).toBe("number")
  })

  test("hub fútbol carga agenda SEO", async ({ page }) => {
    await page.goto("/futbol")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/fútbol/i)
    await expect(page.getByRole("link", { name: /Agenda completa/i })).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Ver semana completa en la agenda/i })
    ).toBeVisible()
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

  test("API widget next-favorite requiere auth", async ({ request }) => {
    const response = await request.get("/api/v1/widget/next-favorite")
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBeTruthy()
  })

  test("API feed-meta incluye todayCount", async ({ request }) => {
    const response = await request.get("/api/feed-meta")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(typeof body.todayCount).toBe("number")
    expect(typeof body.date).toBe("string")
  })

  test("deep link week=1 preserva filtros", async ({ page }) => {
    await page.goto("/?week=1&filtros=futbol")
    await page.waitForFunction(() => !window.location.search.includes("week=1"))
    expect(page.url()).toContain("filtros=futbol")
    expect(page.url()).not.toContain("week=1")
  })

  test("API feed-meta incluye timezone Madrid", async ({ request }) => {
    const response = await request.get("/api/feed-meta")
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.timezone).toBe("Europe/Madrid")
  })

  test("deep link week=1 limpia la URL", async ({ page }) => {
    await page.goto("/?week=1")
    await page.waitForFunction(() => !window.location.search.includes("week=1"))
    expect(page.url()).not.toContain("week=1")
  })

  test("widget categorías embed carga", async ({ page }) => {
    await page.goto("/embed/categorias")
    await expect(page.getByText("Explorar")).toBeVisible()
  })
})
