"use client";

import * as React from "react";
import { Check, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseTemplate } from "@/lib/slots/parse";
import type { DraftSentence, Fact } from "@/lib/types";

import {
  createChipElement,
  extractTemplateFromDom,
  insertChipAtSelection,
} from "./editor-utils";

interface SentenceInlineEditorProps {
  sentence: DraftSentence;
  facts: readonly Fact[];
  onSave: (newTemplate: string) => void;
  onCancel: () => void;
  activeFactToInsert?: Fact | null;
  onFactInserted?: () => void;
}

export function SentenceInlineEditor({
  sentence,
  facts,
  onSave,
  onCancel,
  activeFactToInsert,
  onFactInserted,
}: SentenceInlineEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const factMap = React.useMemo(() => new Map(facts.map((f) => [f.id, f])), [facts]);

  // Initialise DOM content on mount
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.innerHTML = "";
    const segments = parseTemplate(sentence.template);

    for (const seg of segments) {
      if (seg.kind === "text") {
        editor.appendChild(document.createTextNode(seg.value));
      } else if (seg.kind === "fact") {
        const fact = factMap.get(seg.factId);
        const display = fact ? fact.display : seg.factId;
        const chip = createChipElement(seg.factId, display, seg.raw);
        editor.appendChild(chip);
      } else if (seg.kind === "patient") {
        const chip = createChipElement(seg.field, seg.field, seg.raw);
        editor.appendChild(chip);
      }
    }

    // Focus editor and place cursor at end
    editor.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [sentence.template, factMap]);

  // Handle external insert from Fact Panel
  React.useEffect(() => {
    if (!activeFactToInsert || !editorRef.current) return;
    insertChipAtSelection(editorRef.current, activeFactToInsert);
    onFactInserted?.();
  }, [activeFactToInsert, onFactInserted]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const template = extractTemplateFromDom(editorRef.current);
    onSave(template);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factId = e.dataTransfer.getData("application/x-fact-id");
    const fact = factId ? factMap.get(factId) : undefined;
    if (fact && editorRef.current) {
      insertChipAtSelection(editorRef.current, fact);
      return;
    }

    const plainText = e.dataTransfer.getData("text/plain");
    if (plainText) {
      const match = plainText.match(/\{F:([^}|]+)/);
      if (match && factMap.get(match[1]) && editorRef.current) {
        insertChipAtSelection(editorRef.current, factMap.get(match[1])!);
        return;
      }
      document.execCommand("insertText", false, plainText);
    }
  };

  return (
    <div className="rounded-lg border-2 border-teal bg-card p-3 shadow-md space-y-3">
      {/* Editor Header / Info */}
      <div className="flex items-center justify-between text-xs text-subtle border-b border-line pb-2">
        <span className="font-semibold text-teal flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-teal animate-pulse" />
          <span>Editing Sentence {sentence.id}</span>
        </span>
        <span className="text-[11px] text-muted flex items-center gap-1">
          <Info className="size-3 text-teal" aria-hidden="true" />
          <span>Chips are atomic · Raw numerals will trigger NUM-001</span>
        </span>
      </div>

      {/* ContentEditable Container */}
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={`Edit sentence ${sentence.id}`}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
        className="min-h-[70px] p-2.5 rounded bg-paper border border-line text-[16px] leading-[1.7] text-body font-sans focus:outline-none focus:ring-1 focus:ring-teal whitespace-pre-wrap select-text"
      />

      {/* Editor Action Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-muted">
          Press <kbd className="px-1.5 py-0.5 rounded bg-paper-2 border border-line text-[10px] font-mono">⌘Enter</kbd> to save, <kbd className="px-1.5 py-0.5 rounded bg-paper-2 border border-line text-[10px] font-mono">Esc</kbd> to cancel
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs h-8 px-3 text-subtle hover:text-ink"
          >
            <X className="size-3.5 mr-1" aria-hidden="true" />
            <span>Cancel</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="bg-teal hover:bg-teal/90 text-white text-xs h-8 px-3 shadow-xs"
          >
            <Check className="size-3.5 mr-1" aria-hidden="true" />
            <span>Save sentence</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
