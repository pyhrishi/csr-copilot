import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AutonomyPill } from "./AutonomyPill";
import { MatchStatus } from "./MatchStatus";
import { ReleaseBadge } from "./ReleaseBadge";

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
