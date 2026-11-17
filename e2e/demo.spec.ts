import { expect, test } from "@playwright/test";

test.describe("Full 13-Step Guided Demo Walk (Simulated Mode)", () => {
  test("walks the 13 demo steps and asserts all key outcomes", async ({ page }) => {
    // -------------------------------------------------------------------------
    // Step 1: S1 Study Home (/)
    // -------------------------------------------------------------------------
    await page.goto("/");
    await expect(page.getByText(/fictional study data/i)).toBeVisible();
    await expect(page.getByText("CARDIA-3 · Phase III")).toBeVisible();
    await expect(page.getByText("Release 1").first()).toBeVisible();
    await expect(page.getByText("Adverse events", { exact: true })).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 2: S2 Data Readiness (/setup)
    // -------------------------------------------------------------------------
    await page.goto("/setup");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Data Readiness");
    // Assert 5 TLFs parsed
    await expect(page.getByText("5 of 5 Inputs Parsed", { exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Table 14.3.1.1" }).first()).toBeVisible();
    // Assert 2 narrative exceptions
    await expect(page.getByText("2 Open Exceptions", { exact: true })).toBeVisible();
    await expect(page.getByText("CRD301-1402")).toBeVisible();
    await expect(page.getByText("CRD301-2190")).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 3: S3 Section 12.2 (/sections/12.2)
    // -------------------------------------------------------------------------
    await page.goto("/sections/12.2");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adverse events");

    // Click "Generate draft"
    const generateBtn = page.getByRole("button", { name: "Generate draft" }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }
    // Wait for sentences to stream in (sentence 12.2-s1 through 12.2-s5)
    await expect(page.locator("#sentence-12\\.2-s1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#sentence-12\\.2-s5")).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------------------
    // Step 4: S3 Inspect Provenance (Hover & click NumberChip)
    // -------------------------------------------------------------------------
    const firstChip = page.getByRole("button", { name: /Clinical number/ }).first();
    await expect(firstChip).toBeVisible();
    await firstChip.click();

    // Source drawer opens with Table 14.3.1.1 and cell highlighted
    await expect(page.getByRole("dialog").getByRole("heading", { name: /Table 14\.3\.1\.1/ })).toBeVisible();
    // Close drawer via Escape key
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    // -------------------------------------------------------------------------
    // Step 5: S3 Checks Tab (STAT-001 caught and cleared)
    // -------------------------------------------------------------------------
    // Open Checks tab in RightPanel
    const checksTab = page.getByRole("tab", { name: /Checks/i });
    if (await checksTab.isVisible()) {
      await checksTab.click();
    }

    // STAT-001 finding on 12.2-s3
    await expect(page.getByText("STAT-001").first()).toBeVisible();
    const applySuggestionBtn = page.getByRole("button", { name: /Apply suggestion/i }).first();
    await expect(applySuggestionBtn).toBeVisible();
    await applySuggestionBtn.click();

    // Outcome 1: STAT-001 cleared
    await expect(page.getByText("STAT-001")).toBeHidden();

    // -------------------------------------------------------------------------
    // Step 6: S3 Inline Edit (NUM-001 raised and then undone)
    // -------------------------------------------------------------------------
    // Focus and click Edit on sentence 12.2-s1
    const sentence1 = page.locator("#sentence-12\\.2-s1");
    await sentence1.hover();
    const editBtn = sentence1.getByRole("button", { name: "Edit" });
    await editBtn.click();

    // Type raw numerals into contenteditable textbox
    const editor = page.getByRole("textbox", { name: "Edit sentence 12.2-s1" });
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.type(" in 201 patients");

    // Click Save sentence
    const saveBtn = page.getByRole("button", { name: "Save sentence" });
    await saveBtn.click();

    // Outcome 2a: NUM-001 raised
    await expect(sentence1.getByText("NUM-001", { exact: true })).toBeVisible({ timeout: 5000 });

    // Click Undo
    await sentence1.hover();
    const undoBtn = page.locator("[data-testid='undo-sentence-12.2-s1']");
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();

    // Outcome 2b: NUM-001 undone / cleared
    await expect(sentence1.getByText("NUM-001", { exact: true })).toBeHidden();

    // -------------------------------------------------------------------------
    // Step 7: S4 Reconciliation (/sections/12.2/reconciliation)
    // -------------------------------------------------------------------------
    await page.goto("/sections/12.2/reconciliation");

    // Switch role to Biostatistician
    const roleSwitcher = page.getByRole("combobox", { name: "Role" });
    await roleSwitcher.click();
    await page.getByRole("option", { name: "Biostatistician" }).click();

    // Run reconciliation pass
    const runReconciliationBtn = page.getByRole("button", { name: /Run reconciliation/i });
    if (await runReconciliationBtn.isVisible()) {
      await runReconciliationBtn.click();
    }

    // Outcome 3: N of N matched (12 of 12 matched / 100%)
    await expect(page.getByText(/12 of 12 (numbers reconciled|matched) \(100%\)/i)).toBeVisible();

    // Sign off as Biostatistician
    const signOffBtn = page.getByRole("button", { name: /Sign off section/i });
    await expect(signOffBtn).toBeEnabled();
    await signOffBtn.click();
    await expect(page.getByText("Signed off", { exact: true }).first()).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 8: S5 Narratives Queue (/narratives)
    // -------------------------------------------------------------------------
    // Switch role back to Medical Writer
    await roleSwitcher.click();
    await page.getByRole("option", { name: "Medical Writer" }).click();

    await page.goto("/narratives");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Patient Narratives Queue");

    // Click "Generate all ready narratives"
    const generateAllBtn = page.getByRole("button", { name: /Generate all ready narratives/i });
    await expect(generateAllBtn).toBeVisible();
    await generateAllBtn.click();

    // Outcome 4: 10 drafted and 2 exceptions
    await expect(page.getByText(/All ready narratives drafted/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/10 drafted · 0 reviewed/i)).toBeVisible();
    await expect(page.getByText(/2 exceptions/i).first()).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 9: S6 Narrative Detail (/narratives/CRD301-1042)
    // -------------------------------------------------------------------------
    await page.goto("/narratives/CRD301-1042");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Patient Narrative · CRD301-1042/);

    // Timeline SVG and citations visible
    await expect(page.getByRole("region", { name: "Patient clinical timeline" })).toBeVisible();
    await expect(page.getByText(/dizziness and systolic BP/i)).toBeVisible();

    // Safety review sign-off
    const approveBtn = page.getByRole("button", { name: /Approve Narrative/i });
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.getByText(/Safety Physician Approved · Sealed for Submission/i)).toBeVisible();
    }

    // -------------------------------------------------------------------------
    // Step 10: S7 TLF Change Impact (/changes)
    // -------------------------------------------------------------------------
    await page.goto("/changes");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("TLF Change Impact Analysis");

    // Check dizziness 22 -> 23 diff
    await expect(page.getByText("Dizziness").first()).toBeVisible();
    await expect(page.getByText("22 (7.4%)").first()).toBeVisible();
    await expect(page.getByText("23 (7.7%)").first()).toBeVisible();

    // Apply update
    const applyUpdateBtn = page.getByRole("button", { name: /Apply update/i });
    await expect(applyUpdateBtn).toBeVisible();
    await applyUpdateBtn.click();

    // Outcome 5: 12.2-s4 updated after the TLF change
    await page.goto("/sections/12.2");
    const sentence4 = page.locator("#sentence-12\\.2-s4");
    await expect(sentence4).toBeVisible();
    await expect(sentence4.getByText("Source updated")).toBeVisible();
    await expect(sentence4.getByText("23 (7.7%)")).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 11: S8 Audit & Evidence Pack (/audit)
    // -------------------------------------------------------------------------
    // Switch role to Regulatory
    await roleSwitcher.click();
    await page.getByRole("option", { name: "Regulatory" }).click();

    await page.goto("/audit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Audit Trail & Sentence Lineage");

    // Navigate to Evidence Pack
    await page.goto("/audit/evidence/12.2");
    await expect(page.getByText("Evidence Pack · Section 12.2")).toBeVisible();

    // Outcome 6: Evidence pack downloaded
    const downloadPromise = page.waitForEvent("download");
    const downloadBtn = page.getByRole("button", { name: /Download JSON/i });
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("evidence-pack-12.2.json");

    // -------------------------------------------------------------------------
    // Step 12: S10 Autonomy & Risk (/settings/autonomy)
    // -------------------------------------------------------------------------
    // Switch role to QA
    await roleSwitcher.click();
    await page.getByRole("option", { name: "QA" }).click();

    await page.goto("/settings/autonomy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Section Autonomy & Risk Governance");
    await expect(page.getByText("AUTOMATE FIRST (R1 WEDGE)")).toBeVisible();
    await expect(page.getByText("SUPERVISED WITH SIGN-OFF (R2)")).toBeVisible();
    await expect(page.getByText("HUMAN OWNERSHIP")).toBeVisible();
    await expect(page.getByText("LOW PRIORITY / BOILERPLATE")).toBeVisible();

    // -------------------------------------------------------------------------
    // Step 13: S11 Value Dashboard (/value)
    // -------------------------------------------------------------------------
    // Switch role to Executive
    await roleSwitcher.click();
    await page.getByRole("option", { name: "Executive" }).click();

    await page.goto("/value");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Clinical Authoring Value & Impact Dashboard");
    await expect(page.getByText("Days from Database Lock to CSR Draft")).toBeVisible();
    await expect(page.getByText("3.5 days")).toBeVisible();
    await expect(page.getByText("14 hrs")).toBeVisible();
  });
});
