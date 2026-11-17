"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RegenerateDialogProps {
  open: boolean;
  sentenceId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const PRESET_REASONS = [
  "Clinical accuracy or terminology clarification",
  "Statistical terminology alignment",
  "Template phrasing adjustment",
  "Other reason (specify below)",
];

export function RegenerateDialog({
  open,
  sentenceId,
  onOpenChange,
  onConfirm,
}: RegenerateDialogProps) {
  const [selectedPreset, setSelectedPreset] = React.useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = React.useState("");

  const handleConfirm = () => {
    const reason =
      selectedPreset === PRESET_REASONS[3] && customReason.trim()
        ? customReason.trim()
        : selectedPreset;
    onConfirm(reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg text-ink">
            <RefreshCw className="size-5 text-teal" aria-hidden="true" />
            <span>Regenerate Sentence {sentenceId}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-subtle">
            All sentence regenerations require an explicit reason for the regulatory audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-xs font-semibold text-ink block">
            Select Reason for Regeneration
          </label>
          <div className="space-y-1.5">
            {PRESET_REASONS.map((preset) => (
              <label
                key={preset}
                className="flex items-center gap-2 p-2 rounded border border-line bg-paper/50 hover:bg-paper cursor-pointer text-xs"
              >
                <input
                  type="radio"
                  name="regenerate-reason"
                  checked={selectedPreset === preset}
                  onChange={() => setSelectedPreset(preset)}
                  className="text-teal focus:ring-teal"
                />
                <span className="text-body font-medium">{preset}</span>
              </label>
            ))}
          </div>

          {selectedPreset === PRESET_REASONS[3] && (
            <div className="pt-2">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason for audit log..."
                className="w-full h-20 p-2 text-xs rounded border border-line bg-paper text-body focus:ring-1 focus:ring-teal outline-none"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold"
          >
            <RefreshCw className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>Confirm & Regenerate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
