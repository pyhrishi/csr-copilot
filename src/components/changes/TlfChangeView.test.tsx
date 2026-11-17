import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { getFacts, getSections, getTlfRevision, getTlfs } from "@/lib/data/seed";
import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";
import { TlfChangeView } from "./TlfChangeView";

afterEach(() => {
  cleanup();
});

describe("TlfChangeView (S7)", () => {
  const currentFacts = getFacts();
  const currentTlfs = getTlfs();
  const sections = getSections();
  const revision = getTlfRevision();

  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: "writer" });
    useAuditStore.setState({ events: [] });
    useDraftsStore.setState({
      sentences: {},
      sectionStatuses: {},
      tlfRevisionApplied: false,
      customFacts: {},
      customTlfs: {},
    });
  });

  it("renders side-by-side diff of the changed dizziness cell from 22 to 23", () => {
    render(
      <TlfChangeView
        currentFacts={currentFacts}
        currentTlfs={currentTlfs}
        sections={sections}
        revision={revision}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "TLF Change Impact Analysis",
    );
    expect(screen.getAllByText("Dizziness")[0]).toBeInTheDocument();
    expect(screen.getByText("22 (7.4%)")).toBeInTheDocument();
    expect(screen.getByText("23 (7.7%)")).toBeInTheDocument();
    expect(screen.getByText("+1 patient (+0.3%)")).toBeInTheDocument();
    expect(screen.getByText("14.3.1.2.dizziness.velo")).toBeInTheDocument();
  });

  it("displays affected sentence 12.2-s4 with before and after renders", () => {
    render(
      <TlfChangeView
        currentFacts={currentFacts}
        currentTlfs={currentTlfs}
        sections={sections}
        revision={revision}
      />,
    );

    expect(
      screen.getByText(/Affected CSR Prose: Section 12.2 \(Sentence 12.2-s4\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/v1 Current Render/i)).toBeInTheDocument();
    expect(screen.getByText(/Proposed v2 Render/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Dizziness was reported in 22 \(7.4%\) and 15 \(5.0%\) patients/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dizziness was reported in 23 \(7.7%\) and 15 \(5.0%\) patients/i),
    ).toBeInTheDocument();
  });

  it("applies update, swaps facts to v2, logs audit event, and displays link to S4", () => {
    render(
      <TlfChangeView
        currentFacts={currentFacts}
        currentTlfs={currentTlfs}
        sections={sections}
        revision={revision}
      />,
    );

    const applyBtn = screen.getByRole("button", { name: /Apply update/i });
    expect(applyBtn).toBeEnabled();

    fireEvent.click(applyBtn);

    // Verify store updated
    expect(useDraftsStore.getState().tlfRevisionApplied).toBe(true);
    expect(
      useDraftsStore.getState().customFacts["14.3.1.2.dizziness.velo"]?.display,
    ).toBe("23 (7.7%)");

    // Audit event logged
    const events = useAuditStore.getState().events;
    expect(events.some((e) => e.action === "tlf_update" && e.objectId === "14.3.1.2")).toBe(
      true,
    );

    // Verify S4 link is shown
    expect(
      screen.getByRole("link", { name: /View Section 12.2 Reconciliation Report/i }),
    ).toHaveAttribute("href", "/sections/12.2/reconciliation");
  });
});
