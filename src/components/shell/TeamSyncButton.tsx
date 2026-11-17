"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TeamCollaborationModal } from "./TeamCollaborationModal";

export function TeamSyncButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-9 px-3 gap-1.5 text-xs font-semibold text-ink bg-card hover:bg-paper-2 border-line shadow-xs"
        title="Team Collaboration & Study State Sync"
      >
        <Users className="size-3.5 text-teal" />
        <span className="hidden sm:inline">Team Sync</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
        </span>
      </Button>

      <TeamCollaborationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
