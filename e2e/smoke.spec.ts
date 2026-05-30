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
