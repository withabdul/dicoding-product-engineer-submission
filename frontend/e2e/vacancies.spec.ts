import { expect, test } from "@playwright/test";

// Relies on the backend DatabaseSeeder (Product Engineer, Android Developer, ...).
test("user opens the vacancies list page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeVisible();
  await expect(page.getByTestId("job-card").first()).toBeVisible();
});

test("user searches a job by title", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Cari pekerjaan").fill("Android");
  await expect(page.getByTestId("job-card")).toHaveCount(1);
  await expect(page.getByTestId("job-card")).toContainText("Android Developer");
});

test("user views vacancy details", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("job-card").filter({ hasText: "Product Engineer" }).click();
  await expect(page.getByRole("heading", { name: "Product Engineer" })).toBeVisible();
  await expect(page.getByText("Informasi Tambahan")).toBeVisible();
});
