"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for inspection
    console.error("App boundary error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-critical/30 bg-card p-8 text-center shadow-lg space-y-4">
        <div className="size-12 rounded-full bg-critical-tint text-critical flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold text-ink">
            Something went wrong
          </h1>
          <p className="text-xs text-subtle leading-relaxed">
            {error.message || "An unexpected error occurred while rendering this view."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Try again</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="text-xs font-semibold bg-teal hover:bg-teal/90 text-white flex items-center gap-1.5"
          >
            <Link href="/">
              <Home className="size-3.5" aria-hidden="true" />
              <span>Study home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
