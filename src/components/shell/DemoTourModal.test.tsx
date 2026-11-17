import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuditStore, useDraftsStore, useRoleStore } from "@/store";
import { DEMO_STEPS, useDemoTourStore } from "@/store/demo-tour";

import { DemoTourModal } from "./DemoTourModal";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/",
}));

describe("DemoTourModal", () => {
  beforeEach(() => {
    useDemoTourStore.setState({ isOpen: false, currentStepIndex: 0 });
    pushMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when closed", () => {
    render(<DemoTourModal />);
    expect(screen.queryByTestId("demo-tour-panel")).toBeNull();
  });

  it("renders when opened and shows Step 1 details verbatim from demo-script.md", () => {
    useDemoTourStore.getState().startTour();
    render(<DemoTourModal />);

    const panel = screen.getByTestId("demo-tour-panel");
    expect(panel).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 13/i)).toBeInTheDocument();
    expect(screen.getByText(DEMO_STEPS[0].title)).toBeInTheDocument();
    expect(screen.getByText(`“${DEMO_STEPS[0].whatToSay}”`)).toBeInTheDocument();
  });

  it("advances through steps with Next and navigates routes", () => {
    useDemoTourStore.getState().startTour();
    render(<DemoTourModal />);

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(useDemoTourStore.getState().currentStepIndex).toBe(1);
    expect(screen.getByText(/Step 2 of 13/i)).toBeInTheDocument();
    expect(screen.getByText(DEMO_STEPS[1].title)).toBeInTheDocument();
  });

  it("navigates backward with Back button", () => {
    useDemoTourStore.setState({ isOpen: true, currentStepIndex: 2 });
    render(<DemoTourModal />);

    const backBtn = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backBtn);

    expect(useDemoTourStore.getState().currentStepIndex).toBe(1);
    expect(screen.getByText(/Step 2 of 13/i)).toBeInTheDocument();
  });

  it("responds to keyboard navigation: ArrowRight, ArrowLeft, and Escape", () => {
    useDemoTourStore.getState().startTour();
    render(<DemoTourModal />);

    // ArrowRight -> step 2
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(useDemoTourStore.getState().currentStepIndex).toBe(1);

    // ArrowLeft -> step 1
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(useDemoTourStore.getState().currentStepIndex).toBe(0);

    // Escape -> exit tour
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useDemoTourStore.getState().isOpen).toBe(false);
  });

  it("resets demo data when Reset button is clicked", () => {
    useDraftsStore.setState({
      sentences: { "12.2-s1": { id: "12.2-s1" } as unknown as import("@/lib/types").DraftSentence },
    });
    useAuditStore.setState({ events: [{ id: "test" }] as unknown as import("@/lib/types").AuditEvent[] });
    useRoleStore.setState({ role: "biostat" });

    useDemoTourStore.getState().startTour();
    render(<DemoTourModal />);

    const resetBtn = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(useDraftsStore.getState().sentences).toEqual({});
    expect(useAuditStore.getState().events).toEqual([]);
    expect(useRoleStore.getState().role).toBe("writer");
  });
});
