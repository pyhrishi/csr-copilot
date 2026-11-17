"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDemoTourStore } from "@/store/demo-tour";

/**
 * Triggers the guided demo tour following docs/demo-script.md step-by-step.
 */
export function DemoButton() {
  const startTour = useDemoTourStore((s) => s.startTour);
  const isOpen = useDemoTourStore((s) => s.isOpen);

  return (
    <Button
      variant="outline"
      data-testid="start-demo-btn"
      className="h-9 bg-card text-xs font-semibold text-teal border-teal/30 hover:bg-teal-tint/50 shadow-2xs flex items-center gap-1.5"
      onClick={startTour}
      aria-label="Start guided demo tour"
      aria-expanded={isOpen}
    >
      <Play className="size-3.5 fill-teal text-teal" aria-hidden="true" />
      <span>Demo</span>
    </Button>
  );
}
