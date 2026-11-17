"use client";

import * as React from "react";
import { Keyboard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { key: "J / ↓", description: "Select next sentence" },
  { key: "K / ↑", description: "Select previous sentence" },
  { key: "A", description: "Accept focused sentence" },
  { key: "E", description: "Edit focused sentence inline" },
  { key: "R", description: "Reject focused sentence" },
  { key: "?", description: "Open keyboard shortcuts help" },
  { key: "⌘ + Enter", description: "Save sentence while editing" },
  { key: "Esc", description: "Cancel editing or dismiss drawer / dialog" },
];

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg text-ink">
            <Keyboard className="size-5 text-teal" aria-hidden="true" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-subtle">
            Use these shortcuts to review and navigate sentences rapidly.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-line py-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 text-xs"
            >
              <span className="text-body font-medium">{shortcut.description}</span>
              <kbd className="px-2 py-1 rounded bg-paper-2 border border-line text-[11px] font-mono font-semibold text-ink shadow-xs">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
