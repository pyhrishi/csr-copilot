import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getFacts, getPatients } from "@/lib/data/seed";
import { QualityView } from "./QualityView";

afterEach(() => {
  cleanup();
});

describe("QualityView (Screen S9)", () => {
  const facts = getFacts();
  const patients = getPatients();

  it("renders four quality stat cards with gold-set and live metrics", () => {
    render(<QualityView facts={facts} patients={patients} />);

    expect(screen.getByText("Quality & Consistency Assurance")).toBeInTheDocument();
    expect(screen.getByText("Numeric Fidelity")).toBeInTheDocument();
    expect(screen.getByText("Citation Precision")).toBeInTheDocument();
    expect(screen.getByText("Sentence Acceptance Rate")).toBeInTheDocument();
    expect(screen.getByText("Critical Findings Caught Pre-QC")).toBeInTheDocument();
  });

  it("renders cross-section consistency table with matched statuses", () => {
    render(<QualityView facts={facts} patients={patients} />);

    expect(
      screen.getByRole("heading", { name: /Cross-Section Consistency Checks/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Patient Deaths")).toBeInTheDocument();
    expect(screen.getByText("Serious Adverse Events (SAE) Cohort")).toBeInTheDocument();
    expect(screen.getByText("Disposition Accounting Identity")).toBeInTheDocument();

    const matchedBadges = screen.getAllByText("Matched");
    expect(matchedBadges.length).toBe(4);
  });

  it("renders error taxonomy bar chart with rules NUM-001 and STAT-001", () => {
    render(<QualityView facts={facts} patients={patients} />);

    expect(
      screen.getByRole("heading", { name: /Error Taxonomy & Prevention Engine/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("NUM-001")).toBeInTheDocument();
    expect(screen.getByText("STAT-001")).toBeInTheDocument();
    expect(screen.getByText("CITE-001")).toBeInTheDocument();
  });
});
