import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useModeStore } from "@/store";

import { ModeToggle } from "./ModeToggle";

describe("ModeToggle", () => {
  beforeEach(() => {
    useModeStore.setState({ mode: "simulated", liveAvailable: false });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ configured: false }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders Simulated and Live mode options with Simulated selected by default", () => {
    render(<ModeToggle />);

    const simulatedRadio = screen.getByRole("radio", { name: /simulated/i });
    const liveRadio = screen.getByRole("radio", { name: /live/i });

    expect(simulatedRadio).toHaveAttribute("aria-checked", "true");
    expect(liveRadio).toHaveAttribute("aria-checked", "false");
    expect(liveRadio).toHaveAttribute("aria-disabled", "true");
  });

  it("disables Live mode when live is unavailable", () => {
    render(<ModeToggle />);

    const liveRadio = screen.getByRole("radio", { name: /live/i });
    fireEvent.click(liveRadio);

    // Mode stays simulated
    expect(useModeStore.getState().mode).toBe("simulated");
  });

  it("enables Live mode selection when live is available", async () => {
    useModeStore.getState().setLiveAvailable(true, "llama-3.3-70b-versatile", "groq");

    render(<ModeToggle />);

    const liveRadio = screen.getByRole("radio", { name: /live/i });
    expect(liveRadio).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(liveRadio);
    expect(useModeStore.getState().mode).toBe("live");
    expect(liveRadio).toHaveAttribute("aria-checked", "true");
  });
});
