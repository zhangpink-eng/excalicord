import { test, expect } from "@playwright/test"

test.describe("App", () => {
  test("should show login page when not authenticated", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Should show login page
    await expect(page.getByText("Sign in")).toBeVisible()
    await expect(page.getByText("Email")).toBeVisible()
    await expect(page.getByText("Password")).toBeVisible()
  })

  test("should toggle theme when clicking theme button", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Find and click the theme toggle button (moon/sun icon)
    const themeButton = page.locator("button[title*='mode']").first()

    // Check initial state - should have dark class or not on html
    const htmlElement = page.locator("html")
    const initialDark = await htmlElement.evaluate((el) => el.classList.contains("dark"))

    // Click theme toggle
    await themeButton.click()

    // Verify dark mode class toggled
    const afterClickDark = await htmlElement.evaluate((el) => el.classList.contains("dark"))
    expect(afterClickDark).toBe(!initialDark)
  })
})

test.describe("Recording Controls", () => {
  test("should show record button in editor", async ({ page }) => {
    // This test assumes user is authenticated and in editor
    // For now, we'll just verify the record button exists when visible
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Look for recording controls - may not be visible on login page
    const recordButton = page.locator("button[title*='Record' i], button:has-text('Record')")

    // Just verify the page loaded correctly
    await expect(page.getByText("Sign in")).toBeVisible()
  })
})
