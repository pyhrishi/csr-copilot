import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ValueDashboardView } from "./ValueDashboardView";

afterEach(() => {
  cleanup();
});

describe("ValueDashboardView (Screen S11)", () => {
  it("renders visible simulated values label and main title", () => {
    render(<ValueDashboardView />);

    expect(
      screen.getByText("Clinical Authoring Value & Impact Dashboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Simulated values for the prototype"),
    ).toBeInTheDocument();
  });

  it("renders 4 baseline vs current KPI metric cards", () => {
    render(<ValueDashboardView />);

    // DBL to Draft
    expect(
      screen.getByText("Days from Database Lock to CSR Draft"),
    ).toBeInTheDocument();
    expect(screen.getByText("3.5 days")).toBeInTheDocument();
    expect(screen.getAllByText(/42 days/i)[0]).toBeInTheDocument();
    expect(screen.getByText("−91.7%")).toBeInTheDocument();

    // Writer Hours
    expect(
      screen.getByText("Medical Writer Hours (Release 1 Sections)"),
    ).toBeInTheDocument();
    expect(screen.getByText("14 hrs")).toBeInTheDocument();
    expect(screen.getAllByText(/110/i)[0]).toBeInTheDocument();
    expect(screen.getByText("−87.3%")).toBeInTheDocument();

    // Acceptance Rate
    expect(
      screen.getByText("Sentence Acceptance Rate"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/88%/i)[0]).toBeInTheDocument();
    expect(screen.getByText("+43%")).toBeInTheDocument();

    // Critical Errors Intercepted
    expect(
      screen.getByText("Critical Errors Caught Pre-QC"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/100%/i)[0]).toBeInTheDocument();
    expect(screen.getByText("+82%")).toBeInTheDocument();
  });

  it("renders benchmark comparison chart and pilot assumptions", () => {
    render(<ValueDashboardView />);

    expect(
      screen.getByRole("heading", {
        name: /Benchmark Comparison: Traditional Workflow vs CSR Copilot/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Executive Sponsor Pilot Assumptions/i),
    ).toBeInTheDocument();
  });
});
