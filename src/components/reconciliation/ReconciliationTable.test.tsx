import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Fact, Section, Tlf } from "@/lib/types";
import type { ReconciliationRow } from "@/lib/reconcile";
import { ReconciliationTable } from "./ReconciliationTable";

afterEach(() => {
  cleanup();
});

const mockSection: Section = {
  id: "12.2",
  title: "Adverse events",
  release: "R1",
  autonomy: "L2",
  tlfs: ["14.3.1.1"],
  sentences: [
    {
      id: "12.2-s1",
      text: "Velorantib 50 mg was administered to {F:f-14-3-1-1-velo-n} patients.",
      cites: ["14.3.1.1"],
    },
  ],
};

const mockFact: Fact = {
  id: "f-14-3-1-1-velo-n",
  value: { n: 212, N: 220, pct: 96.4 },
  display: "212 (96.4%)",
  kind: "n_pct",
  row: "any_teae",
  column: "velo",
  population: "Safety",
  tlf: "14.3.1.1",
  tlfVersion: 1,
  cell: { row: 0, col: 0 },
  rowLabel: "Any adverse event",
  columnLabel: "Velorantib 50 mg (N=220)",
};

const mockTlf: Tlf = {
  id: "14.3.1.1",
  title: "Summary of Adverse Events",
  population: "Safety Population",
  version: 1,
  footnotes: [],
  columns: ["Statistic"],
  rows: [
    {
      key: "any_ae",
      label: "Any adverse event",
      cells: [
        {
          display: "212 (96.4%)",
          factId: "f-14-3-1-1-velo-n",
        },
      ],
    },
  ],
};

const mockRow: ReconciliationRow = {
  sentenceId: "12.2-s1",
  factId: "f-14-3-1-1-velo-n",
  format: "n",
  renderedValue: "212",
  tlf: "14.3.1.1",
  tlfVersion: 1,
  cell: { row: 0, col: 0 },
  rowLabel: "Any adverse event",
  columnLabel: "Velorantib 50 mg (N=220)",
  sourceDisplay: "212 (96.4%)",
  expectedValue: "212",
  matched: true,
};

const mockSummary = {
  total: 1,
  matched: 1,
  mismatched: 0,
  allMatched: true,
};

describe("ReconciliationTable", () => {
  it("renders table with sentence link, NumberChip, fact id, and MatchStatus", () => {
    render(
      <ReconciliationTable
        section={mockSection}
        rows={[mockRow]}
        summary={mockSummary}
        facts={[mockFact]}
        tlfs={[mockTlf]}
      />,
    );

    expect(screen.getByText("12.2-s1")).toBeInTheDocument();
    expect(screen.getByText("f-14-3-1-1-velo-n")).toBeInTheDocument();
    expect(screen.getByText("Table 14.3.1.1")).toBeInTheDocument();
    expect(screen.getByText("Matched")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run reconciliation" })).toBeInTheDocument();
  });

  it("handles 'Run reconciliation' pass with reduced motion", () => {
    // Mock matchMedia to simulate prefers-reduced-motion: reduce
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ReconciliationTable
        section={mockSection}
        rows={[mockRow]}
        summary={mockSummary}
        facts={[mockFact]}
        tlfs={[mockTlf]}
      />,
    );

    const runBtn = screen.getByRole("button", { name: "Run reconciliation" });
    fireEvent.click(runBtn);

    expect(screen.getByText("1 of 1 verified")).toBeInTheDocument();
  });
});
