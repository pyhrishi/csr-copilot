"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  Quote,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/roles";
import { DEMO_STEPS, useDemoTourStore } from "@/store/demo-tour";
import { useRoleStore } from "@/store/role";

export function DemoTourModal() {
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useDemoTourStore((s) => s.isOpen);
  const currentStepIndex = useDemoTourStore((s) => s.currentStepIndex);
  const nextStep = useDemoTourStore((s) => s.nextStep);
  const prevStep = useDemoTourStore((s) => s.prevStep);
  const goToStep = useDemoTourStore((s) => s.goToStep);
  const exitTour = useDemoTourStore((s) => s.exitTour);
  const resetDemoData = useDemoTourStore((s) => s.resetDemoData);

  const highlightedElRef = useRef<HTMLElement | null>(null);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Synchronize route and role on step change
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Switch role where the demo script specifies
    const currentRole = useRoleStore.getState().role;
    if (currentRole !== currentStep.role) {
      useRoleStore.getState().setRole(currentStep.role);
    }

    // Navigate to step route if needed
    if (pathname !== currentStep.route) {
      router.push(currentStep.route);
    }

    // Cleanup previous highlight
    if (highlightedElRef.current) {
      highlightedElRef.current.classList.remove(
        "ring-2",
        "ring-teal",
        "ring-offset-2",
        "ring-offset-paper",
        "animate-pulse",
      );
      highlightedElRef.current = null;
    }

    // Highlight target element
    const timer = setTimeout(() => {
      if (currentStep.targetSelector) {
        try {
          const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add(
              "ring-2",
              "ring-teal",
              "ring-offset-2",
              "ring-offset-paper",
              "animate-pulse",
            );
            highlightedElRef.current = el;
          }
        } catch {
          // ignore selector errors
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      if (highlightedElRef.current) {
        highlightedElRef.current.classList.remove(
          "ring-2",
          "ring-teal",
          "ring-offset-2",
          "ring-offset-paper",
          "animate-pulse",
        );
        highlightedElRef.current = null;
      }
    };
  }, [isOpen, currentStepIndex, currentStep, pathname, router]);

  // Keyboard navigation: ArrowRight / ArrowLeft / Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.key === "Escape") {
        e.preventDefault();
        exitTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextStep, prevStep, exitTour]);

  if (!isOpen || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === DEMO_STEPS.length - 1;

  const handleResetData = () => {
    resetDemoData();
    toast.success("Demo Data Reset", {
      description: "Drafts and audit log cleared back to clean initial state.",
    });
  };

  return (
    <aside
      role="region"
      aria-label="Guided Demo Tour"
      data-testid="demo-tour-panel"
      className="fixed bottom-5 right-5 z-50 w-[420px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line bg-card/95 backdrop-blur-md p-4 shadow-xl text-ink space-y-3.5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal text-white text-[11px] font-bold uppercase tracking-wider">
            <Play className="size-3 fill-current" aria-hidden="true" />
            Step {currentStep.step} of 13
          </span>
          <span className="text-xs font-semibold text-subtle truncate max-w-[170px]">
            {currentStep.screen}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetData}
            title="Reset demo data (clears drafts and audit)"
            className="h-7 px-2 text-xs text-subtle hover:text-ink hover:bg-paper-2 flex items-center gap-1"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            <span className="text-[10px] hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={exitTour}
            title="Exit demo tour (Esc)"
            className="h-7 w-7 p-0 text-subtle hover:text-ink hover:bg-paper-2"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Exit tour</span>
          </Button>
        </div>
      </div>

      {/* Title & Role Info */}
      <div>
        <div className="flex items-center justify-between text-xs text-subtle mb-1">
          <span className="font-semibold text-teal text-[11px] uppercase tracking-wider">
            {currentStep.title}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-paper-2 text-[10px] font-medium border border-line">
            Role: <strong>{roleLabel(currentStep.role)}</strong>
          </span>
        </div>
      </div>

      {/* Target Action */}
      <div className="rounded-lg bg-paper-2 border border-line p-2.5 text-xs text-ink flex items-start gap-2 shadow-2xs">
        <Target className="size-4 text-teal shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-subtle block">
            Action to demonstrate:
          </span>
          <p className="font-semibold text-ink mt-0.5">{currentStep.action}</p>
        </div>
      </div>

      {/* What to Say Speech Bubble */}
      <div className="rounded-xl bg-teal-tint/60 border border-teal/30 p-3 text-xs leading-relaxed text-ink shadow-2xs">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal mb-1">
          <Quote className="size-3" aria-hidden="true" />
          <span>What to say</span>
        </div>
        <p className="italic text-ink font-serif text-[13px] leading-snug">
          &ldquo;{currentStep.whatToSay}&rdquo;
        </p>
      </div>

      {/* Controls & Pagination Footer */}
      <div className="flex items-center justify-between pt-1">
        {/* Step dots */}
        <div className="flex items-center gap-1" title={`Step ${currentStep.step} of 13`}>
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => goToStep(idx)}
              className={`size-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "bg-teal scale-125"
                  : idx < currentStepIndex
                    ? "bg-teal/40 hover:bg-teal/70"
                    : "bg-line hover:bg-subtle"
              }`}
              title={`Go to step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={isFirstStep}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            <ArrowLeft className="size-3.5 mr-1" aria-hidden="true" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              size="sm"
              onClick={exitTour}
              className="h-8 px-3 text-xs font-semibold bg-teal hover:bg-teal/90 text-white shadow-xs"
            >
              <CheckCircle className="size-3.5 mr-1.5" aria-hidden="true" />
              Finish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={nextStep}
              className="h-8 px-3 text-xs font-semibold bg-teal hover:bg-teal/90 text-white shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-[10px] text-center text-subtle border-t border-line/50 pt-1.5 flex items-center justify-center gap-3">
        <span>
          <kbd className="px-1 py-0.2 rounded bg-paper-2 border border-line text-[9px] font-mono">
            ←
          </kbd>{" "}
          Back
        </span>
        <span>
          <kbd className="px-1 py-0.2 rounded bg-paper-2 border border-line text-[9px] font-mono">
            →
          </kbd>{" "}
          Next
        </span>
        <span>
          <kbd className="px-1 py-0.2 rounded bg-paper-2 border border-line text-[9px] font-mono">
            Esc
          </kbd>{" "}
          Exit
        </span>
      </div>
    </aside>
  );
}
