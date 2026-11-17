import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AutonomyPill } from "./AutonomyPill";
import { CitationMarker } from "./CitationMarker";
import { MatchStatus } from "./MatchStatus";
import { NumberChip } from "./NumberChip";
import { ProvenanceLegend, ProvenanceShade } from "./ProvenanceShade";
import { ReleaseBadge } from "./ReleaseBadge";
import { SourceDrawer } from "./SourceDrawer";

afterEach(() => {
  cleanup();
});

describe("ReleaseBadge", () => {
  it("renders Release 1 with icon and word", () => {
    render(<ReleaseBadge release="R1" />);
    expect(screen.getByText("Release 1")).toBeInTheDocument();
  });

  it("renders Release 2 with short format", () => {
    render(<ReleaseBadge release="R2" short />);
    expect(screen.getByText("R2")).toBeInTheDocument();
  });

  it("renders Human authored", () => {
    render(<ReleaseBadge release="human" />);
    expect(screen.getByText("Human authored")).toBeInTheDocument();
  });

  it("renders Locked", () => {
    render(<ReleaseBadge release="locked" />);
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });
});

describe("AutonomyPill", () => {
  it("renders L2 with word", () => {
    render(<AutonomyPill level="L2" />);
    expect(screen.getByText("L2 · Draft")).toBeInTheDocument();
  });

  it("renders L0 retrieve", () => {
    render(<AutonomyPill level="L0" />);
    expect(screen.getByText("L0 · Retrieve")).toBeInTheDocument();
  });

  it("renders locked", () => {
    render(<AutonomyPill level="locked" />);
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });
});

describe("MatchStatus", () => {
  it("renders matched state with check icon and Matched text", () => {
    render(<MatchStatus matched={true} />);
    expect(screen.getByText("Matched")).toBeInTheDocument();
  });

  it("renders mismatch state with Mismatch text and expected/actual values", () => {
    render(<MatchStatus matched={false} actual="12" expected="15" />);
    expect(screen.getByText("Mismatch")).toBeInTheDocument();
    expect(screen.getByText(/\(got 12, expected 15\)/)).toBeInTheDocument();
  });
});

describe("NumberChip", () => {
  it("renders slot value and triggers onClick", () => {
    const handleClick = vi.fn();
    render(
      <NumberChip
        factId="14.3.1.1.sae.velo"
        value="7 (2.3%)"
        onClick={handleClick}
      />,
    );

    const chip = screen.getByRole("button", { name: /Clinical number/ });
    expect(chip).toHaveTextContent("7 (2.3%)");

    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledWith("14.3.1.1.sae.velo");
  });

  it("handles Enter keydown to activate", () => {
    const handleClick = vi.fn();
    render(
      <NumberChip
        factId="14.3.1.1.sae.velo"
        value="7 (2.3%)"
        onClick={handleClick}
      />,
    );

    const chip = screen.getByRole("button", { name: /Clinical number/ });
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledWith("14.3.1.1.sae.velo");
  });
});

describe("CitationMarker", () => {
  it("formats 14.3.1.1 to T14.3.1.1 and handles click", () => {
    const handleClick = vi.fn();
    render(<CitationMarker sourceId="14.3.1.1" onClick={handleClick} />);

    const marker = screen.getByRole("button", { name: /Citation T14.3.1.1/ });
    expect(marker).toHaveTextContent("T14.3.1.1");

    fireEvent.click(marker);
    expect(handleClick).toHaveBeenCalledWith("14.3.1.1");
  });
});

describe("ProvenanceShade", () => {
  it("renders AI-generated shading", () => {
    const { container } = render(
      <ProvenanceShade provenance="ai">AI Sentence</ProvenanceShade>,
    );
    expect(container.firstChild).toHaveClass("bg-teal-tint/45");
  });

  it("renders ProvenanceLegend", () => {
    render(<ProvenanceLegend />);
    expect(screen.getByText("AI-generated")).toBeInTheDocument();
    expect(screen.getByText("AI-edited")).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
  });
});

describe("SourceDrawer", () => {
  const mockTlf = {
    id: "14.3.1.1",
    title: "Overview of TEAEs",
    population: "Safety (N=597)",
    version: 1,
    columns: ["Velorantib 20 mg", "Placebo"],
    rows: [
      {
        key: "any_teae",
        label: "Any TEAE",
        cells: [
          { factId: "14.3.1.1.any_teae.velo", display: "201 (67.4%)" },
          { factId: "14.3.1.1.any_teae.pbo", display: "189 (63.2%)" },
        ],
      },
    ],
    footnotes: ["A TEAE is defined as an AE starting on or after study drug."],
  };

  it("renders TLF details and highlights cited cell", () => {
    render(
      <SourceDrawer
        open={true}
        onOpenChange={() => {}}
        tlf={mockTlf}
        highlightFactId="14.3.1.1.any_teae.velo"
      />,
    );

    expect(screen.getByText("Table 14.3.1.1")).toBeInTheDocument();
    expect(screen.getByText(/Overview of TEAEs/)).toBeInTheDocument();
    expect(screen.getByText("Any TEAE")).toBeInTheDocument();

    const citedCell = screen.getByTitle(/Cited cell \(14.3.1.1.any_teae.velo\)/);
    expect(citedCell).toHaveClass("ring-teal");
  });
});
