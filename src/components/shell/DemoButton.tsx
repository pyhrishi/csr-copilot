"use client";

import { Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Placeholder: the guided tour following docs/demo-script.md arrives in M8. */
export function DemoButton() {
  return (
    <Button
      variant="outline"
      className="h-9 bg-card"
      onClick={() =>
        toast.info("Guided demo arrives in M8", {
          description: "It will walk through docs/demo-script.md step by step.",
        })
      }
    >
      <Play aria-hidden />
      Demo
    </Button>
  );
}
