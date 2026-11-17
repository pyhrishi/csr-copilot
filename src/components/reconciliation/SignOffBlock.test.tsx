import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Finding, Section } from "@/lib/types";
import { SignOffBlock } from "./SignOffBlock";

afterEach(() => {
  cleanup();
});

const mockSection: Section = {
  id: "12.2",
  title: "Adverse events",
  release: "R1",
  autonomy: "L2",
  tlfs: ["14.3.1.1", "14.3.1.2"],
  sentences: [],
};

const mockSummary = {
  total: 12,
  matched: 12,
  mismatched: 0,
  allMatched: true,
};

const mockCriticalFinding: Finding = {
  ruleId: "STAT-001",
  severity: "critical",
  message: "Statistical claim without supporting p-value",
  span: [0, 10],
};

describe("SignOffBlock", () => {
  it("disables sign-off for Medical Writer role with explicit reason", () => {
    const onSignOff = vi.fn();
    render(
      <SignOffBlock
        section={mockSection}
        role="writer"
        criticalFindings={[]}
        summary={mockSummary}
        isSignedOff={false}
        onSignOff={onSignOff}
      />,
    );

    const button = screen.getByRole("button", { name: /Sign off section/i });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/Sign-off requires the Biostatistician role/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/I confirm the numbers in this section match the source TLFs/i),
    ).toBeInTheDocument();
  });

  it("disables sign-off for Biostatistician when critical findings are open", () => {
    const onSignOff = vi.fn();
    render(
      <SignOffBlock
        section={mockSection}
        role="biostat"
        criticalFindings={[mockCriticalFinding]}
        summary={mockSummary}
        isSignedOff={false}
        onSignOff={onSignOff}
      />,
    );

    const button = screen.getByRole("button", { name: /Sign off section/i });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/Regulatory Gate: 1 open critical finding/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/STAT-001/i).length).toBeGreaterThanOrEqual(1);
  });

  it("enables sign-off for Biostatistician with 0 critical findings and calls onSignOff on click", () => {
    const onSignOff = vi.fn();
    render(
      <SignOffBlock
        section={mockSection}
        role="biostat"
        criticalFindings={[]}
        summary={mockSummary}
        isSignedOff={false}
        onSignOff={onSignOff}
      />,
    );

    const button = screen.getByRole("button", { name: "Sign off section" });
    expect(button).toBeEnabled();
    expect(screen.getByText("Marcus Vance, PhD")).toBeInTheDocument();
    expect(screen.getByText("Biostatistician")).toBeInTheDocument();
    expect(
      screen.getByText(/Ready for Biostatistician Signature/i),
    ).toBeInTheDocument();

    fireEvent.click(button);
    expect(onSignOff).toHaveBeenCalledTimes(1);
  });

  it("renders signed off state with signature details", () => {
    const onSignOff = vi.fn();
    render(
      <SignOffBlock
        section={mockSection}
        role="biostat"
        criticalFindings={[]}
        summary={mockSummary}
        isSignedOff={true}
        onSignOff={onSignOff}
        lastSignOffEvent={{
          id: "evt-123",
          at: "2026-11-17T12:00:00Z",
          actor: "Marcus Vance, PhD (Principal Biostatistician)",
          role: "biostat",
          action: "sign_off",
          objectId: "12.2",
          detail: "Signed off section",
        }}
      />,
    );

    expect(screen.getByText("Signed Off · Sealed")).toBeInTheDocument();
    expect(
      screen.getByText("Marcus Vance, PhD (Principal Biostatistician)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Signed Off & Recorded")).toBeInTheDocument();
  });
});
