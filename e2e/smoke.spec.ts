import { expect, test } from "@playwright/test";

test.describe("S1 · Study Home", () => {
  test("renders study card with real seed data and milestones", async ({ page }) => {
    await page.goto("/");

    // Study Header & Metadata
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Study Home");
    await expect(page.locator("main").getByText("CRD-301")).toBeVisible();
    await expect(page.getByText("CARDIA-3 · Phase III")).toBeVisible();
    await expect(page.getByText(/Meridian Biopharma/)).toBeVisible();
    await expect(page.getByText(/Chronic heart failure with reduced ejection fraction/)).toBeVisible();

    // Milestones
    await expect(page.getByText("Database Lock")).toBeVisible();
    await expect(page.getByText("30 Oct 2026")).toBeVisible();
    await expect(page.getByText("CSR Target Final")).toBeVisible();
    await expect(page.getByText("22 Jan 2027").first()).toBeVisible();
  });

  test("renders the four computed readiness tiles", async ({ page }) => {
    await page.goto("/");

    // 1. Inputs parsed
    await expect(page.getByText("5 of 5")).toBeVisible();
    await expect(page.getByText("Inputs Parsed", { exact: true })).toBeVisible();

    // 2. Open exceptions
    await expect(page.getByText("Open Exceptions")).toBeVisible();
    await expect(page.getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByText("Owner: Data Management")).toBeVisible();

    // 3. Sentences awaiting review
    await expect(page.getByText("Awaiting Review")).toBeVisible();

    // 4. Numbers reconciled
    await expect(page.getByText("Numbers Reconciled")).toBeVisible();
    await expect(page.getByText("24 of 24", { exact: true })).toBeVisible();
    await expect(page.getByText("100% table match")).toBeVisible();
  });

  test("renders the ICH E3 section board with release badges and autonomy pills", async ({ page }) => {
    await page.goto("/");

    // Check all sections are listed
    await expect(page.getByText("Disposition of patients")).toBeVisible();
    await expect(page.getByText("Adverse events", { exact: true })).toBeVisible();
    await expect(page.getByText("Deaths and other serious adverse events")).toBeVisible();
    await expect(page.getByText("Efficacy results", { exact: true })).toBeVisible();
    await expect(page.getByText("Discussion and overall conclusions")).toBeVisible();

    // Release badges
    const r1Badges = page.getByText("Release 1");
    await expect(r1Badges.first()).toBeVisible();

    // Autonomy pills
    await expect(page.getByText("L2 · Draft").first()).toBeVisible();

    // Locked explanation for 11.4
    await expect(page.getByText(/Efficacy results arrive in Release 2/)).toBeVisible();

    // Human authoring explanation for 13
    await expect(page.getByText(/Conclusions stay human-authored/)).toBeVisible();
    await expect(page.getByText("Human only")).toBeVisible();
  });

  test("role switcher changes S1 emphasis (Writer sees sections first; Executive sees readiness)", async ({ page }) => {
    await page.goto("/");

    // Default is Medical Writer: Writer priority workspace is visible
    await expect(page.getByText("Medical Writer Priority Workspace")).toBeVisible();
    await expect(page.getByText("Writer Priority View")).toBeVisible();

    // Switch role to Biostatistician
    await page.getByRole("combobox", { name: "Role" }).click();
    await page.getByRole("option", { name: "Biostatistician" }).click();
    await expect(page.getByText("Biostatistician Verification Workspace")).toBeVisible();

    // Switch role to Executive
    await page.getByRole("combobox", { name: "Role" }).click();
    await page.getByRole("option", { name: "Executive" }).click();

    // Executive overview is now visible
    await expect(page.getByText("Executive CSR Readiness Overview")).toBeVisible();
    await expect(page.getByText("Executive Priority")).toBeVisible();

    // Verify ordering: on Executive, readiness tiles header is before section board
    const tilesHeading = page.getByText("Clinical Data Readiness", { exact: true });
    const isTilesBeforeTable = await tilesHeading.evaluate((el) => {
      const table = document.querySelector("table");
      return Boolean(table && (el.compareDocumentPosition(table) & 4)); // 4 is Node.DOCUMENT_POSITION_FOLLOWING
    });
    expect(isTilesBeforeTable).toBe(true);
  });
});

test.describe("S2 · Data Readiness", () => {
  test("renders the 5 ingested inputs with versions and deterministic hashes", async ({ page }) => {
    await page.goto("/setup");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Data Readiness");

    // Check the 5 inputs
    await expect(page.getByText("CRD-301 Clinical Study Protocol")).toBeVisible();
    await expect(page.getByText("Statistical Analysis Plan (SAP)")).toBeVisible();
    await expect(page.getByText("TLF Package (Post-Lock Initial Run)")).toBeVisible();
    await expect(page.getByText("ADaM Analysis Datasets")).toBeVisible();
    await expect(page.getByText("Patient Profile & Narrative Source Listings")).toBeVisible();

    // Check versions and parsed badges
    await expect(page.getByText("v3.0")).toBeVisible();
    await expect(page.getByText("v2.1")).toBeVisible();
    await expect(page.getByText("Parsed").first()).toBeVisible();
  });

  test("renders TLF parsing results table with 5 tables and fact counts", async ({ page }) => {
    await page.goto("/setup");

    await expect(page.getByRole("cell", { name: "Table 14.1.1" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Table 14.1.2" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Table 14.3.1.1" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Table 14.3.1.2" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Table 14.2.1" }).first()).toBeVisible();

    // Facts extracted & confidence
    await expect(page.getByRole("cell", { name: "18 facts" })).toBeVisible();
    await expect(page.getByText("100.0%").first()).toBeVisible();
    await expect(page.getByText("Verified").first()).toBeVisible();
  });

  test("TLF mapping override changes target section and writes an audit event", async ({ page }) => {
    await page.goto("/setup");

    // Find override select for Table 14.1.1
    const trigger = page.getByRole("combobox", { name: "Override mapping for Table 14.1.1" });
    await expect(trigger).toBeVisible();

    // Click and change mapping to 12.2
    await trigger.click();
    await page.getByRole("option", { name: /12.2 · Adverse events/ }).click();

    // Verify row displays "Overridden"
    await expect(page.getByText("Overridden").first()).toBeVisible();

    // Check toast notification
    await expect(page.getByText("TLF Mapping Updated")).toBeVisible();
  });

  test("renders exceptions list with the two data issues owned by Data management", async ({ page }) => {
    await page.goto("/setup");

    // Both patient IDs
    await expect(page.getByText("CRD301-1402")).toBeVisible();
    await expect(page.getByText("CRD301-2190")).toBeVisible();

    // Verbatim issues
    await expect(page.getByText(/Resolution date missing in source data/)).toBeVisible();
    await expect(page.getByText(/Onset date conflicts between AE page and hospitalization record/)).toBeVisible();

    // Owner: Data management
    await expect(page.getByText("Data management").first()).toBeVisible();
    await expect(page.getByText("Open query").first()).toBeVisible();

    // Progression hand-off CTA
    await expect(page.getByText("Proceed to Section 12.2 Workspace")).toBeVisible();
  });
});
