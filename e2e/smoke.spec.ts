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

test.describe("S3 · Section Workspace", () => {
  test("Section 12.2 streams 5 sentences with number chips and opens SourceDrawer", async ({ page }) => {
    await page.goto("/sections/12.2");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Heading & Provenance Legend
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adverse events");
    await expect(page.getByLabel("Provenance legend")).toBeVisible();
    await expect(page.getByText("Provenance:")).toBeVisible();

    // Generate Draft if not already generated
    const generateBtn = page.getByRole("button", { name: "Generate draft" }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page.getByText("5 of 5 sentences")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText("5 of 5 sentences")).toBeVisible();
    }

    // Number chips should be visible
    const chips = page.getByRole("button", { name: /Clinical number/ });
    await expect(chips.first()).toBeVisible();

    // Click first number chip to open SourceDrawer
    await chips.first().click();

    // Verify SourceDrawer is open with Table details
    await expect(page.getByRole("heading", { name: /Table 14\./ })).toBeVisible();
    await expect(page.getByText("Cited cell highlighted", { exact: true })).toBeVisible();

    // Close SourceDrawer before interacting with the right panel behind it
    await page.keyboard.press("Escape");

    // Checks tab has STAT-001 finding on 12.2-s3
    await page.getByRole("tab", { name: /Checks/ }).click();
    await expect(page.getByText("STAT-001")).toBeVisible();
  });

  test("Section 12.2 generates draft, applies STAT-001 fix, accepts all sentences and enables review", async ({ page }) => {
    await page.goto("/sections/12.2");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Generate Draft if not present
    const generateBtn = page.getByRole("button", { name: "Generate draft" }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page.getByText("5 of 5 sentences")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText("5 of 5 sentences")).toBeVisible();
    }

    // Open Checks tab
    await page.getByRole("tab", { name: /Checks/ }).click();
    await expect(page.getByText("STAT-001")).toBeVisible();
    await expect(page.getByText("1 critical", { exact: true })).toBeVisible();

    // Verify "Send to review" is disabled due to open critical finding
    const disabledSendBtn = page.getByRole("button", { name: /Send to review/i });
    await expect(disabledSendBtn).toBeDisabled();

    // Apply suggestion on STAT-001
    const applySuggestionBtn = page.getByRole("button", { name: "Apply suggestion" });
    await expect(applySuggestionBtn).toBeVisible();
    await applySuggestionBtn.click();

    // Verify finding cleared and all checks passed
    await expect(page.getByText("All Checks Passed")).toBeVisible();
    await expect(page.getByText("0 open findings")).toBeVisible();

    // Accept all 5 sentences
    const acceptButtons = page.getByRole("button", { name: /^Accept/ });
    const count = await acceptButtons.count();
    expect(count).toBe(5);
    for (let i = 0; i < count; i++) {
      await acceptButtons.nth(i).click();
    }

    // Status bar reflects 5 accepted, 0 pending, 0 open findings
    await expect(page.getByText("5 accepted")).toBeVisible();
    await expect(page.getByText("0 pending")).toBeVisible();

    // Send to review is now enabled
    const enabledSendBtn = page.getByRole("button", { name: "Send to review" });
    await expect(enabledSendBtn).toBeEnabled();
    await enabledSendBtn.click();

    // Toast confirms section is in review
    await expect(page.getByText(/Section In Review/i)).toBeVisible();
  });

  test("Keyboard shortcuts dialog opens and inline editing flags raw numerals with NUM-001", async ({ page }) => {
    await page.goto("/sections/12.2");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Generate Draft if not present
    const generateBtn = page.getByRole("button", { name: "Generate draft" }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page.getByText("5 of 5 sentences")).toBeVisible({ timeout: 10000 });
    }

    // Open Keyboard Shortcuts via ? shortcut
    await page.keyboard.press("?");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();
    await page.keyboard.press("Escape");

    // Click Edit on first sentence
    const editBtns = page.getByRole("button", { name: /^Edit/ });
    await editBtns.first().click();

    // ContentEditable box is visible
    const editor = page.locator("[contenteditable='true']").first();
    await expect(editor).toBeVisible();

    // Type a raw numeral into editor
    await editor.type(" in 201 patients");

    // Save sentence
    await page.getByRole("button", { name: "Save sentence" }).click();

    // Checks tab now displays NUM-001 critical finding
    await page.getByRole("tab", { name: /Checks/ }).click();
    await expect(page.getByText("NUM-001", { exact: true })).toBeVisible();
    await expect(page.getByText(/Critical Findings \(\d+\)/)).toBeVisible();
    await expect(page.getByText(/critical/i).first()).toBeVisible();
  });

  test("Sections 10.1 and 12.3 generate drafts with number chips", async ({ page }) => {
    // 10.1 Disposition
    await page.goto("/sections/10.1");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Disposition of patients");
    const genBtn101 = page.getByRole("button", { name: "Generate draft" }).first();
    if (await genBtn101.isVisible()) {
      await genBtn101.click();
      await expect(page.getByText("3 of 3 sentences")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText("3 of 3 sentences")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Clinical number/ }).first()).toBeVisible();

    // 12.3 Deaths
    await page.goto("/sections/12.3");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deaths and other serious adverse events");
    const genBtn123 = page.getByRole("button", { name: "Generate draft" }).first();
    if (await genBtn123.isVisible()) {
      await genBtn123.click();
      await expect(page.getByText("3 of 3 sentences")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText("3 of 3 sentences")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Clinical number/ }).first()).toBeVisible();
  });

  test("Sections 11.4 and 13 display expected locked states", async ({ page }) => {
    // 11.4 (R2 Locked)
    await page.goto("/sections/11.4");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Efficacy results");
    await expect(page.getByText(/Efficacy results arrive in Release 2 with biostatistician sign-off/)).toBeVisible();
    await expect(page.getByText("Locked for Release 2")).toBeVisible();

    // 13 (Human Authoring)
    await page.goto("/sections/13");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Discussion and overall conclusions");
    await expect(page.getByText(/Conclusions stay human-authored; AI supplies a fact panel only/)).toBeVisible();
    await expect(page.getByText("Human-Authored Section")).toBeVisible();

    // Section 13 displays Fact Panel
    await expect(page.getByRole("tab", { name: /Fact Panel/ })).toBeVisible();
  });
});

test.describe("S4 · Reconciliation Report", () => {
  test("Section 12.2 reconciliation report renders numbers, gating blocks sign-off for writer and STAT-001, and biostatistician signs off", async ({ page }) => {
    // 1. Start as Medical Writer on Section 12.2
    await page.goto("/sections/12.2");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Ensure role is Medical Writer
    const roleCombobox = page.getByRole("combobox", { name: "Role" });
    await roleCombobox.click();
    await page.getByRole("option", { name: "Medical Writer" }).click();

    // Generate draft if not generated
    const generateBtn = page.getByRole("button", { name: "Generate draft" }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page.getByText("5 of 5 sentences")).toBeVisible({ timeout: 10000 });
    }

    // 2. Click Reconciliation button in section status bar to navigate to S4
    const reconciliationLink = page.getByRole("link", { name: "Reconciliation", exact: true });
    await expect(reconciliationLink).toBeVisible();
    await reconciliationLink.click();

    await page.waitForURL("/sections/12.2/reconciliation");

    // 3. Verify S4 Title, Summary line and table
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Numeric Reconciliation");
    await expect(page.getByText("12 of 12 numbers reconciled (100%)")).toBeVisible();
    await expect(page.getByText("Extracted Numbers vs Source TLF Cells")).toBeVisible();

    // Table rows
    await expect(page.getByText("12.2-s1").first()).toBeVisible();
    await expect(page.getByText("Table 14.3.1.1").first()).toBeVisible();
    await expect(page.getByText("Matched").first()).toBeVisible();

    // Run reconciliation button
    const runBtn = page.getByRole("button", { name: "Run reconciliation" });
    await expect(runBtn).toBeVisible();
    await runBtn.click();
    await expect(page.getByText("12 of 12 verified")).toBeVisible();

    // Inspect SourceDrawer by clicking a NumberChip
    const numberChip = page.getByRole("button", { name: /Clinical number/ }).first();
    await numberChip.click();
    await expect(page.getByText("Cited cell highlighted", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");

    // 4. Verify SignOffBlock is disabled for Medical Writer
    const signOffBtn = page.getByRole("button", { name: /Sign off section/i });
    await expect(signOffBtn).toBeDisabled();
    await expect(page.getByText(/Sign-off requires the Biostatistician role/i)).toBeVisible();

    // 5. Switch role to Biostatistician
    await roleCombobox.click();
    await page.getByRole("option", { name: "Biostatistician" }).click();

    // 6. Sign-off is STILL disabled if STAT-001 is open!
    const stat001Warning = page.getByText(/Regulatory Gate: 1 open critical finding/i);
    if (await stat001Warning.isVisible()) {
      await expect(page.getByText("STAT-001").first()).toBeVisible();
      await expect(signOffBtn).toBeDisabled();

      // Return to S3 to fix STAT-001
      await page.getByRole("link", { name: /Return to Section Workspace/i }).click();
      await page.waitForURL("/sections/12.2");

      // Open Checks tab and apply suggestion
      await page.getByRole("tab", { name: /Checks/ }).click();
      const applyFixBtn = page.getByRole("button", { name: "Apply suggestion" });
      await applyFixBtn.click();
      await expect(page.getByText("All Checks Passed")).toBeVisible();

      // Return to S4 Reconciliation
      await page.getByRole("link", { name: "Reconciliation", exact: true }).click();
      await page.waitForURL("/sections/12.2/reconciliation");
    }

    // 7. Now Biostatistician with 0 critical findings: Sign-off is enabled!
    await expect(page.getByText(/Ready for Biostatistician Signature/i)).toBeVisible();
    await expect(page.getByText("Marcus Vance, PhD")).toBeVisible();
    await expect(page.getByText("Biostatistician").first()).toBeVisible();
    await expect(page.getByText(/I confirm the numbers in this section match the source TLFs/i)).toBeVisible();

    const enabledSignOffBtn = page.getByRole("button", { name: "Sign off section" });
    await expect(enabledSignOffBtn).toBeEnabled();
    await enabledSignOffBtn.click();

    // 8. Verify Signed Off state on S4
    await expect(page.getByText("Signed Off · Sealed")).toBeVisible();
    await expect(page.getByText("Signed Off & Recorded")).toBeVisible();

    // 9. Navigate to S1 (Study Home) and verify Section 12.2 shows "Signed off"
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    const section122Row = page.getByRole("row", { name: /12.2.*Adverse events/i });
    await expect(section122Row.getByText("Signed off")).toBeVisible();
  });
});
