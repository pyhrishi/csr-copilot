"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { SourceDrawer } from "@/components/trust";
import { DraftCanvas } from "@/components/workspace/DraftCanvas";
import { LockedSectionView } from "@/components/workspace/LockedSectionView";
import { RightPanel } from "@/components/workspace/RightPanel";
import { SectionOutline } from "@/components/workspace/SectionOutline";
import type { StatRule } from "@/lib/data/seed-types";
import { generateSimulatedDraft } from "@/lib/generation/simulated";
import { roleLabel } from "@/lib/roles";
import type { DraftSentence, Fact, Section, Tlf } from "@/lib/types";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useRoleStore } from "@/store/role";

interface SectionWorkspaceViewProps {
  section: Section;
  allSections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  rules: readonly StatRule[];
}

export function SectionWorkspaceView({
  section,
  allSections,
  facts,
  tlfs,
  rules,
}: SectionWorkspaceViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFactId, setActiveFactId] = useState<string | undefined>(undefined);
  const [activeTlfId, setActiveTlfId] = useState<string | undefined>(undefined);

  // Client store subscriptions
  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => ({}) as Record<string, DraftSentence>,
  );

  const role = useSyncExternalStore(
    useRoleStore.subscribe,
    () => useRoleStore.getState().role,
    () => "writer" as const,
  );

  const appendAudit = useAuditStore((state) => state.append);
  const setSentence = useDraftsStore((state) => state.setSentence);

  // Sentences belonging to this section
  const currentSentences = section.sentences
    .map((s) => draftSentences[s.id])
    .filter(Boolean) as DraftSentence[];

  const isLockedOrHuman =
    section.release === "R2" ||
    section.release === "human" ||
    section.autonomy === "locked";

  // Click on NumberChip opens drawer with cited cell
  const handleFactClick = (factId: string) => {
    const fact = facts.find((f) => f.id === factId);
    setActiveFactId(factId);
    if (fact) {
      setActiveTlfId(fact.tlf);
    } else {
      const parts = factId.split(".");
      setActiveTlfId(parts.slice(0, 3).join("."));
    }
    setDrawerOpen(true);
  };

  // Click on CitationMarker opens drawer for that TLF
  const handleCitationClick = (sourceId: string) => {
    setActiveFactId(undefined);
    const match = sourceId.match(/^(1[46]\.\d+(\.\d+)*)/);
    const tlfId = match ? match[1] : sourceId;
    setActiveTlfId(tlfId);
    setDrawerOpen(true);
  };

  // Generate simulated draft
  const handleGenerate = async () => {
    if (isGenerating || isLockedOrHuman) return;

    setIsGenerating(true);
    try {
      const generated = await generateSimulatedDraft({
        section,
        facts,
        tlfs,
        rules,
        allSections,
        delayMs: 380,
        onSentence: (sentence) => {
          setSentence(sentence);
        },
      });

      // Log generation to immutable audit trail
      appendAudit({
        actor: `${roleLabel(role)} (${role})`,
        role,
        action: "generate",
        objectId: section.id,
        detail: `Generated simulated draft for Section ${section.id} (${generated.length} sentences with deterministic slot filling)`,
        versions: { prompt: "v1.0", template: "v1.0" },
      });

      toast.success("Draft Generated", {
        description: `Streamed ${generated.length} sentences with verified numbers from source tables.`,
      });
    } catch (err) {
      toast.error("Generation failed", {
        description: (err as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTlf =
    tlfs.find((t) => t.id === activeTlfId) ??
    (section.tlfs.length > 0 ? tlfs.find((t) => t.id === section.tlfs[0]) : tlfs[0]);

  return (
    <div className="flex h-[calc(100vh-var(--topbar-h)-var(--banner-h))] overflow-hidden bg-paper">
      {/* Pane 1: Left Outline (260px) */}
      <SectionOutline
        sections={allSections}
        activeSectionId={section.id}
        draftSentences={draftSentences}
      />

      {/* Pane 2 & 3: Center Canvas & Right Panel OR Locked Section View */}
      {isLockedOrHuman ? (
        <LockedSectionView
          section={section}
          facts={facts}
          sentences={currentSentences}
          onFactClick={handleFactClick}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Pane 2: Draft Canvas (1fr) */}
          <DraftCanvas
            section={section}
            sentences={currentSentences}
            facts={facts}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onFactClick={handleFactClick}
            onCitationClick={handleCitationClick}
          />

          {/* Pane 3: Right Panel (360px) */}
          <RightPanel
            section={section}
            facts={facts}
            sentences={currentSentences}
            onFactClick={handleFactClick}
          />
        </div>
      )}

      {/* Source Drawer (560px sheet) */}
      <SourceDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tlf={selectedTlf}
        highlightFactId={activeFactId}
      />
    </div>
  );
}
