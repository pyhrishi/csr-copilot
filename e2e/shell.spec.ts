import { expect, test } from "@playwright/test";

const BANNER = "Prototype · fictional study data · not for clinical use";

test("the shell shows the banner, top bar and all screens in the nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("note", { name: "Prototype notice" })).toHaveText(BANNER);
  await expect(page.getByRole("banner")).toContainText("CRD-301");
  await expect(page.getByRole("radio", { name: /Simulated/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByRole("radio", { name: /Live/ })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("navigation", { name: "Screens" }).getByRole("link")).toHaveCount(11);
});

test("every nav link opens a page with a heading and the fiction banner", async ({ page }) => {
  await page.goto("/");
  const links = page.getByRole("navigation", { name: "Screens" }).getByRole("link");
  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")!));

  for (const href of hrefs) {
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1 }), href).toBeVisible();
    await expect(page.getByText(BANNER), href).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Screens" }).locator('[aria-current="page"]'),
      href,
    ).toHaveAttribute("href", href);
  }
});

test("the chosen role persists across a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Role" }).click();
  await page.getByRole("option", { name: "Biostatistician" }).click();
  await expect(page.getByRole("combobox", { name: "Role" })).toContainText("Biostatistician");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Role" })).toContainText("Biostatistician");
});

test("unknown sections show the not-found page inside the shell", async ({ page }) => {
  await page.goto("/sections/99.9");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn't exist");
  await expect(page.getByText(BANNER)).toBeVisible();
});
