import { describe, expect, it } from "vitest";

import { getFacts, getSection, getSections } from "@/lib/data/seed";
import { exportFullCsrDossierToDocx, exportSectionToDocx } from "./docx";

describe("exportSectionToDocx", () => {
  it("builds a valid DOCX blob for Section 12.2 with rendered numbers", async () => {
    const section = getSection("12.2")!;
    const facts = getFacts();

    const blob = await exportSectionToDocx({
      section,
      facts,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  });

  it("compiles and builds a full multi-section CSR dossier DOCX blob", async () => {
    const sections = getSections();
    const facts = getFacts();

    const blob = await exportFullCsrDossierToDocx({
      sections,
      facts,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(2000);
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  });
});
