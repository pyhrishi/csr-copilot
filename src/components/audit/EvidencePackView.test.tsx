import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { getFacts, getSections, getTlfs } from "@/lib/data/seed";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";
import { EvidencePackView } from "./EvidencePackView";

afterEach(() => {
  cleanup();
});

describe("EvidencePackView (/audit/evidence/[sectionId])", () => {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();

  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: "regulatory" });
    useAuditStore.setState({
      events: [
        {
          id: "aud-sign-01",
          at: "2026-11-01T14:30:00.000Z",
          actor: "Marcus Vance, PhD",
          role: "biostat",
          action: "sign_off",
          objectId: "12.2",
          detail: "Signed off Section 12.2 reconciliation report",
        },
      ],
    });
    useDraftsStore.setState({
      sentences: {},
      sectionStatuses: {},
      tlfRevisionApplied: false,
      customFacts: {},
      customTlfs: {},
    });
  });

  it("renders inspection-ready evidence package with study details, input hashes, reconciliation, and sign-offs", () => {
    render(
      <EvidencePackView
        sectionId="12.2"
        sections={sections}
        facts={facts}
        tlfs={tlfs}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Clinical Study Report Evidence Pack (21 CFR Part 11)",
    );
    expect(screen.getByText("CRD-301")).toBeInTheDocument();
    expect(screen.getByText("velorantib")).toBeInTheDocument();
    expect(screen.getByText(/12.2 Adverse events/)).toBeInTheDocument();

    // 1. Ingested Input Hashes
    expect(
      screen.getByText(/1\. Ingested Input Hashes & Ingestion Lineage/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/CRD-301 Clinical Study Protocol/i)).toBeInTheDocument();

    // 2. Numeric Reconciliation
    expect(
      screen.getByText(/2\. Numeric Reconciliation Report/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/12 of 12 numbers reconciled \(100%\)/i)).toBeInTheDocument();

    // 3. Electronic Sign-Offs
    expect(
      screen.getByText(/3\. 21 CFR Part 11 Electronic Signature Record/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Marcus Vance, PhD")[0]).toBeInTheDocument();
    expect(
      screen.getByText(/I confirm the numbers in this section match the source TLFs/i),
    ).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole("button", { name: /Print \/ Save PDF/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download JSON/i })).toBeInTheDocument();
  });
});
