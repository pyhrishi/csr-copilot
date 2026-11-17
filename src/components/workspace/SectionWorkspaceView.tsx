"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { SourceDrawer } from "@/components/trust";
import { DraftCanvas } from "@/components/workspace/DraftCanvas";
import { LockedSectionView } from "@/components/workspace/LockedSectionView";
import { RegenerateDialog } from "@/components/workspace/RegenerateDialog";
import { RightPanel } from "@/components/workspace/RightPanel";
import { SectionOutline } from "@/components/workspace/SectionOutline";
import { ShortcutsDialog } from "@/components/workspace/ShortcutsDialog";
import type { StatRule } from "@/lib/data/seed-types";
import { generateSimulatedDraft } from "@/lib/generation/simulated";
import { roleLabel } from "@/lib/roles";
import { renderSlots } from "@/lib/slots/render";
import { computeSectionStatus, type SectionDraftStatus } from "@/lib/study-readiness";
import type { DraftSentence, Fact, Finding, Section, Tlf } from "@/lib/types";
import { buildReferenceIndex, loadRules, validateSentence } from "@/lib/validate";
import { useAuditStore } from "@/store/audit";
import { useDraftsStore } from "@/store/drafts";
import { useModeStore } from "@/store/mode";
import { useRoleStore } from "@/store/role";

import { applySuggestionToTemplate } from "./editor-utils";

interface SectionWorkspaceViewProps {
  section: Section;
  allSections: readonly Section[];
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  rules: readonly StatRule[];
}

const EMPTY_SENTENCES: Record<string, DraftSentence> = {};
const EMPTY_STATUSES: Record<string, SectionDraftStatus> = {};

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

  // Interaction states for M3 part 2
  const [focusedSentenceId, setFocusedSentenceId] = useState<string | null>(null);
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  const [activeFactToInsert, setActiveFactToInsert] = useState<Fact | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [regenerateTargetId, setRegenerateTargetId] = useState<string | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [highlightedSentenceId, setHighlightedSentenceId] = useState<string | null>(null);

  // Client store subscriptions
  const draftSentences = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sentences,
    () => EMPTY_SENTENCES,
  );

  const sectionStatuses = useSyncExternalStore(
    useDraftsStore.subscribe,
    () => useDraftsStore.getState().sectionStatuses,
    () => EMPTY_STATUSES,
  );

  const role = useSyncExternalStore(
    useRoleStore.subscribe,
    () => useRoleStore.getState().role,
    () => "writer" as const,
  );

  const appendAudit = useAuditStore((state) => state.append);
  const setSentence = useDraftsStore((state) => state.setSentence);
  const setSentenceState = useDraftsStore((state) => state.setSentenceState);
  const setSectionStatus = useDraftsStore((state) => state.setSectionStatus);
  const customFacts = useDraftsStore((state) => state.customFacts);
  const customTlfs = useDraftsStore((state) => state.customTlfs);

  const activeFacts = useMemo(() => {
    return facts.map((f) => customFacts[f.id] ?? f);
  }, [facts, customFacts]);

  const activeTlfs = useMemo(() => {
    return tlfs.map((t) => customTlfs[t.id] ?? t);
  }, [tlfs, customTlfs]);

  // Sentences belonging to this section
  const currentSentences = useMemo(() => {
    return section.sentences
      .map((s) => draftSentences[s.id])
      .filter(Boolean) as DraftSentence[];
  }, [section.sentences, draftSentences]);

  const isLockedOrHuman =
    section.release === "R2" ||
    section.release === "human" ||
    section.autonomy === "locked";

  const validationCtx = useMemo(() => {
    const factMap = new Map(activeFacts.map((f) => [f.id, f]));
    const compiledRules = loadRules(rules);
    const references = buildReferenceIndex({ tlfs: activeTlfs, sections: allSections });
    return { facts: factMap, rules: compiledRules, references };
  }, [activeFacts, rules, activeTlfs, allSections]);

  const { status: currentStatus } = computeSectionStatus(
    section,
    draftSentences,
    sectionStatuses,
  );

  // Accept sentence
  const handleAccept = useCallback(
    (sentenceId: string) => {
      const s = draftSentences[sentenceId];
      if (!s) return;

      setSentenceState(sentenceId, "accepted");
      appendAudit({
        actor: `${roleLabel(role)} (${role})`,
        role,
        action: "accept",
        objectId: sentenceId,
        detail: `Accepted sentence ${sentenceId} (${s.provenance})`,
      });
      toast.success("Sentence Accepted", {
        description: `Sentence ${sentenceId} marked as accepted.`,
      });
    },
    [draftSentences, setSentenceState, appendAudit, role],
  );

  // Reject sentence
  const handleReject = useCallback(
    (sentenceId: string) => {
      const s = draftSentences[sentenceId];
      if (!s) return;

      setSentenceState(sentenceId, "rejected");
      appendAudit({
        actor: `${roleLabel(role)} (${role})`,
        role,
        action: "reject",
        objectId: sentenceId,
        detail: `Rejected sentence ${sentenceId}`,
      });
      toast.error("Sentence Rejected", {
        description: `Sentence ${sentenceId} marked as rejected.`,
      });
    },
    [draftSentences, setSentenceState, appendAudit, role],
  );

  // Start inline editing
  const handleEdit = useCallback((sentenceId: string) => {
    setEditingSentenceId(sentenceId);
    setFocusedSentenceId(sentenceId);
  }, []);

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

  // Global keyboard shortcuts (A, E, R, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input, textarea or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[contenteditable='true']"))
      ) {
        return;
      }

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        const ids = currentSentences.map((s) => s.id);
        if (ids.length > 0) {
          const currentIndex = focusedSentenceId ? ids.indexOf(focusedSentenceId) : -1;
          const nextIndex = currentIndex < ids.length - 1 ? currentIndex + 1 : 0;
          setFocusedSentenceId(ids[nextIndex]);
          const el = document.getElementById(`sentence-${ids[nextIndex]}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        const ids = currentSentences.map((s) => s.id);
        if (ids.length > 0) {
          const currentIndex = focusedSentenceId ? ids.indexOf(focusedSentenceId) : ids.length;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : ids.length - 1;
          setFocusedSentenceId(ids[prevIndex]);
          const el = document.getElementById(`sentence-${ids[prevIndex]}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      if (!focusedSentenceId) return;

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleAccept(focusedSentenceId);
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleEdit(focusedSentenceId);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReject(focusedSentenceId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedSentenceId, currentSentences, handleAccept, handleEdit, handleReject]);

  // Save inline edit: re-runs renderSlots and validateSentence
  const handleSaveEdit = (sentenceId: string, newTemplate: string) => {
    const existing = draftSentences[sentenceId];
    if (!existing) return;

    try {
      // 1. Render slots for new template
      const newRendered = renderSlots(newTemplate, { facts });

      // 2. Validate sentence
      const newFindings = validateSentence(
        { template: newTemplate, cites: existing.cites },
        validationCtx,
      );

      const updatedSentence: DraftSentence = {
        ...existing,
        template: newTemplate,
        rendered: newRendered,
        provenance: "ai_edited",
        findings: newFindings,
        state: "pending",
      };

      setSentence(updatedSentence);
      setEditingSentenceId(null);

      // 3. Log audit event
      appendAudit({
        actor: `${roleLabel(role)} (${role})`,
        role,
        action: "edit",
        objectId: sentenceId,
        detail: `Edited sentence ${sentenceId} inline. Validators re-run: ${newFindings.length} findings open.`,
      });

      // 4. Alert user if critical finding (e.g. NUM-001)
      const numFinding = newFindings.find((f) => f.ruleId === "NUM-001");
      if (numFinding) {
        toast.error("NUM-001 Critical Finding Raised", {
          description: numFinding.message,
        });
      } else {
        toast.success("Sentence Saved", {
          description: `Sentence ${sentenceId} updated (AI-edited) and verified.`,
        });
      }
    } catch (err) {
      toast.error("Save Failed", {
        description: (err as Error).message,
      });
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingSentenceId(null);
  };

  // Undo manual edit and revert to template
  const handleUndoEdit = (sentenceId: string) => {
    const templateDef = section.sentences.find((s) => s.id === sentenceId);
    if (!templateDef) return;

    const rendered = renderSlots(templateDef.text, { facts: activeFacts });
    const findings = validateSentence(
      { template: templateDef.text, cites: templateDef.cites },
      validationCtx,
    );

    const restored: DraftSentence = {
      id: templateDef.id,
      sectionId: section.id,
      template: templateDef.text,
      rendered,
      provenance: "ai",
      state: "pending",
      cites: templateDef.cites,
      generation: {
        mode: "simulated",
        promptVersion: "v1.0",
        templateVersion: "v1.0",
        at: new Date().toISOString(),
      },
      findings,
    };

    setSentence(restored);
    appendAudit({
      actor: `${roleLabel(role)} (${role})`,
      role,
      action: "edit",
      objectId: sentenceId,
      detail: `Undid manual edit on sentence ${sentenceId}, reverted to original AI template.`,
    });

    toast.success("Edit Undone", {
      description: `Sentence ${sentenceId} restored to original verified template.`,
    });
  };

  // Open regenerate reason dialog
  const handleRegenerate = (sentenceId: string) => {
    setRegenerateTargetId(sentenceId);
    setRegenerateOpen(true);
  };

  // Confirm sentence regeneration
  const handleConfirmRegenerate = (reason: string) => {
    if (!regenerateTargetId) return;

    const templateDef = section.sentences.find((s) => s.id === regenerateTargetId);
    if (!templateDef) return;

    const rendered = renderSlots(templateDef.text, { facts });
    const findings = validateSentence(
      { template: templateDef.text, cites: templateDef.cites },
      validationCtx,
    );

    const refreshed: DraftSentence = {
      id: templateDef.id,
      sectionId: section.id,
      template: templateDef.text,
      rendered,
      provenance: "ai",
      state: "pending",
      cites: templateDef.cites,
      generation: {
        mode: "simulated",
        promptVersion: "v1.0",
        templateVersion: "v1.0",
        at: new Date().toISOString(),
      },
      findings,
    };

    setSentence(refreshed);
    appendAudit({
      actor: `${roleLabel(role)} (${role})`,
      role,
      action: "regenerate",
      objectId: regenerateTargetId,
      detail: `Regenerated sentence ${regenerateTargetId}. Reason: ${reason}`,
    });

    toast.success("Sentence Regenerated", {
      description: `Sentence ${regenerateTargetId} reset from template.`,
    });
  };

  // Apply suggestion (e.g. STAT-001 on 12.2-s3)
  const handleApplySuggestion = (sentenceId: string, finding: Finding) => {
    const existing = draftSentences[sentenceId];
    if (!existing) return;

    const newTemplate = applySuggestionToTemplate(existing.template, finding);
    const newRendered = renderSlots(newTemplate, { facts });
    const newFindings = validateSentence(
      { template: newTemplate, cites: existing.cites },
      validationCtx,
    );

    const updated: DraftSentence = {
      ...existing,
      template: newTemplate,
      rendered: newRendered,
      provenance: "ai_edited",
      findings: newFindings,
    };

    setSentence(updated);
    setHighlightedSentenceId(sentenceId);
    setFocusedSentenceId(sentenceId);
    const targetEl = document.getElementById(`sentence-${sentenceId}`);
    targetEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedSentenceId(null), 2500);

    appendAudit({
      actor: `${roleLabel(role)} (${role})`,
      role,
      action: "edit",
      objectId: sentenceId,
      detail: `Applied suggestion for ${finding.ruleId} on ${sentenceId}: ${finding.suggestion || "resolved"}`,
    });

    toast.success("Suggestion Applied", {
      description: `${finding.ruleId} resolved on ${sentenceId}; sentence marked AI-edited.`,
    });
  };

  // Insert fact from Fact Panel into sentence
  const handleInsertFact = (fact: Fact) => {
    if (editingSentenceId) {
      setActiveFactToInsert(fact);
      return;
    }

    // If no sentence is in edit mode, target focused sentence or first sentence
    const targetId = focusedSentenceId ?? currentSentences[0]?.id;
    if (targetId) {
      setEditingSentenceId(targetId);
      setFocusedSentenceId(targetId);
      setActiveFactToInsert(fact);
      toast.info(`Editing ${targetId}`, {
        description: `Inserted fact ${fact.display} into sentence.`,
      });
    }
  };

  // Send section to review
  const handleSendToReview = () => {
    setSectionStatus(section.id, "in_review");
    appendAudit({
      actor: `${roleLabel(role)} (${role})`,
      role,
      action: "edit",
      objectId: section.id,
      detail: `Submitted Section ${section.id} for formal review.`,
    });
    toast.success("Section In Review", {
      description: `Section ${section.id} has been submitted to reviewers.`,
    });
  };

  // Focus and scroll to sentence from Checks tab
  const handleSelectSentence = (sentenceId: string) => {
    setFocusedSentenceId(sentenceId);
    const el = document.getElementById(`sentence-${sentenceId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const mode = useModeStore((s) => s.mode);
  const liveModel = useModeStore((s) => s.liveModel);

  // Generate draft (simulated or live)
  const handleGenerate = async () => {
    if (isGenerating || isLockedOrHuman) return;

    setIsGenerating(true);
    try {
      let generated: DraftSentence[] = [];

      if (mode === "live") {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ sectionId: section.id }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Generation failed" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.type === "sentence" && payload.sentence) {
                  setSentence(payload.sentence);
                  generated.push(payload.sentence);
                } else if (payload.type === "done" && payload.sentences) {
                  generated = payload.sentences;
                } else if (payload.type === "error") {
                  throw new Error(payload.error);
                }
              } catch (e) {
                if ((e as Error).message.includes("error")) throw e;
              }
            }
          }
        }

        if (generated.length > 0) {
          setFocusedSentenceId(generated[0].id);
        }

        appendAudit({
          actor: `${roleLabel(role)} (${role})`,
          role,
          action: "generate",
          objectId: section.id,
          detail: `Generated live AI draft for Section ${section.id} (${generated.length} sentences with deterministic slot filling)`,
          versions: {
            prompt: "v1.0",
            template: "v1.0",
            model: liveModel || "llama-3.3-70b-versatile",
          },
        });

        toast.success("Live AI Draft Generated", {
          description: `Streamed ${generated.length} sentences via ${liveModel || "open-source model"} with deterministic number chips.`,
        });
      } else {
        generated = await generateSimulatedDraft({
          section,
          facts,
          tlfs,
          rules,
          allSections,
          delayMs: 350,
          onSentence: (sentence) => {
            setSentence(sentence);
          },
        });

        if (generated.length > 0) {
          setFocusedSentenceId(generated[0].id);
        }

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
      }
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
    <div data-hydrated="true" className="flex h-[calc(100dvh-var(--topbar-h,64px)-var(--banner-h,28px))] overflow-hidden bg-paper">
      {/* Pane 1: Left Outline (260px) */}
      <SectionOutline
        sections={allSections}
        activeSectionId={section.id}
        draftSentences={draftSentences}
        sectionStatuses={sectionStatuses}
      />

      {/* Pane 2 & 3: Center Canvas & Right Panel OR Locked Section View */}
      {isLockedOrHuman ? (
        <LockedSectionView
          section={section}
          facts={activeFacts}
          sentences={currentSentences}
          onFactClick={handleFactClick}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Pane 2: Draft Canvas (1fr) */}
          <DraftCanvas
            section={section}
            sentences={currentSentences}
            facts={activeFacts}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            isReadOnly={role === "exec"}
            onFactClick={handleFactClick}
            onCitationClick={handleCitationClick}
            focusedSentenceId={focusedSentenceId}
            highlightedSentenceId={highlightedSentenceId}
            onFocusSentence={setFocusedSentenceId}
            editingSentenceId={editingSentenceId}
            onEdit={handleEdit}
            onUndoEdit={handleUndoEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onAccept={handleAccept}
            onReject={handleReject}
            onRegenerate={handleRegenerate}
            onSendToReview={handleSendToReview}
            sectionStatus={currentStatus}
            isSubmittedToReview={sectionStatuses[section.id] === "in_review"}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            activeFactToInsert={activeFactToInsert}
            onFactInserted={() => setActiveFactToInsert(null)}
          />

          {/* Pane 3: Right Panel (360px) */}
          <RightPanel
            section={section}
            facts={activeFacts}
            tlfs={activeTlfs}
            sentences={currentSentences}
            editingSentenceId={editingSentenceId}
            onFactClick={handleFactClick}
            onInsertFact={handleInsertFact}
            onSelectSentence={handleSelectSentence}
            onApplySuggestion={handleApplySuggestion}
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

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Regenerate Reason Dialog */}
      <RegenerateDialog
        open={regenerateOpen}
        sentenceId={regenerateTargetId}
        onOpenChange={setRegenerateOpen}
        onConfirm={handleConfirmRegenerate}
      />
    </div>
  );
}
