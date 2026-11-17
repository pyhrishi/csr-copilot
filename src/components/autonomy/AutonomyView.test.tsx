import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";
import { AutonomyView } from "./AutonomyView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

describe("AutonomyView (Screen S10)", () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: "writer" });
    useAuditStore.setState({ events: [] });
    useDraftsStore.setState({
      sentences: {},
      sectionStatuses: {},
      sectionAutonomy: {},
    });
  });

  it("renders SVG 2x2 risk matrix with quadrants and plotted dots", () => {
    render(<AutonomyView />);

    expect(screen.getByText("Section Autonomy & Risk Governance")).toBeInTheDocument();
    expect(screen.getByText(/ICH E3 Section Risk Matrix/i)).toBeInTheDocument();
    expect(screen.getByText("HUMAN OWNERSHIP")).toBeInTheDocument();
    expect(screen.getByText("AUTOMATE FIRST (R1 WEDGE)")).toBeInTheDocument();
    expect(screen.getByText("SUPERVISED WITH SIGN-OFF (R2)")).toBeInTheDocument();
  });

  it("disables change controls for non-QA roles", () => {
    render(<AutonomyView />);

    // Writer role cannot change autonomy
    const lockedButtons = screen.getAllByRole("button", { name: /Locked \(QA Only\)/i });
    expect(lockedButtons.length).toBeGreaterThan(0);
    expect(lockedButtons[0]).toBeDisabled();
  });

  it("allows QA role to change autonomy level with required reason and logs audit event", () => {
    useRoleStore.setState({ role: "qa" });
    render(<AutonomyView />);

    expect(screen.getByText(/QA Role Active/i)).toBeInTheDocument();

    const changeButtons = screen.getAllByRole("button", { name: "Change Level" });
    expect(changeButtons[0]).toBeEnabled();

    // Click Change Level on first section (14.3.3)
    fireEvent.click(changeButtons[0]);

    expect(screen.getByRole("heading", { name: /Change Section Autonomy Level/i })).toBeInTheDocument();

    // Type written reason
    const textarea = screen.getByPlaceholderText(/State the clinical, statistical or validation reason/i);
    fireEvent.change(textarea, { target: { value: "Qualified in three consecutive clinical trials per GxP SOP-042." } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Authorize & Log Audit/i });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    // Verify audit event
    const events = useAuditStore.getState().events;
    expect(events.length).toBe(1);
    expect(events[0].action).toBe("autonomy_change");
    expect(events[0].detail).toContain("Qualified in three consecutive clinical trials");
  });
});
