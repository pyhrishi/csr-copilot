import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ValidatorBadge } from "./ValidatorBadge";

describe("ValidatorBadge", () => {
  it("renders critical severity with word, icon, and rule ID", () => {
    const { container } = render(
      <ValidatorBadge severity="critical" ruleId="STAT-001" />,
    );

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("STAT-001")).toBeInTheDocument();
    expect(container.querySelector("span[data-severity='critical']")).toHaveClass(
      "text-critical",
    );
  });

  it("renders major severity with amber styling", () => {
    const { container } = render(
      <ValidatorBadge severity="major" ruleId="STAT-002" />,
    );

    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("STAT-002")).toBeInTheDocument();
    expect(container.querySelector("span[data-severity='major']")).toHaveClass(
      "text-amber",
    );
  });

  it("renders minor severity with subtle styling", () => {
    render(
      <ValidatorBadge severity="minor" ruleId="NUM-001" />,
    );

    expect(screen.getByText("Minor")).toBeInTheDocument();
    expect(screen.getByText("NUM-001")).toBeInTheDocument();
  });
});
