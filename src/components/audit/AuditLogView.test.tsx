import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { getFacts, getSections, getTlfs } from "@/lib/data/seed";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";
import { AuditLogView } from "./AuditLogView";

afterEach(() => {
  cleanup();
});

describe("AuditLogView (S8)", () => {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();

  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: "regulatory" });
    useAuditStore.setState({
      events: [
        {
          id: "aud-001",
          at: "2026-11-01T10:00:00.000Z",
          actor: "Dr. Sarah Chen",
          role: "writer",
          action: "generate",
          objectId: "12.2",
          detail: "Generated Section 12.2 draft",
          versions: { model: "simulated-v1", prompt: "v1.2", template: "12.2-v1" },
        },
        {
          id: "aud-002",
          at: "2026-11-01T10:15:00.000Z",
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

  it("renders append-only audit trail with time, actor, role, action, object, and versions", () => {
    render(<AuditLogView sections={sections} facts={facts} tlfs={tlfs} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Audit Trail & Sentence Lineage",
    );
    expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Marcus Vance, PhD")).toBeInTheDocument();
    expect(screen.getByText("Generated Section 12.2 draft")).toBeInTheDocument();
    expect(
      screen.getByText("Signed off Section 12.2 reconciliation report"),
    ).toBeInTheDocument();

    // Verify no delete or edit buttons
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("renders sentence lineage inspector with 6-step vertical timeline", () => {
    render(<AuditLogView sections={sections} facts={facts} tlfs={tlfs} />);

    expect(
      screen.getByRole("heading", { name: /Sentence Lineage Inspector/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1\. Source Ingestion & Fact Extraction/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2\. Template Generation & Slot Binding/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3\. Deterministic Numeric Filling/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/4\. Automated Quality & Language Rules/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/5\. Human-in-the-Loop Edits & Fixes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6\. Electronic Sign-Off & Verification/i),
    ).toBeInTheDocument();
  });

  it("displays regulatory evidence pack export link", () => {
    render(<AuditLogView sections={sections} facts={facts} tlfs={tlfs} />);

    const exportBtn = screen.getByRole("link", { name: /Export Evidence Pack/i });
    expect(exportBtn).toHaveAttribute("href", "/audit/evidence/12.2");
  });
});
