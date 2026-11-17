// Reconciliation: every number in a section is re-read from the fact store and compared with the
// TLF cell it came from. The summary is computed from the rows, never typed.
import { formatFact, renderSlots } from "@/lib/slots";
import type { Fact, RenderedPart, Section, SlotFormat, Tlf } from "@/lib/types";

export interface ReconciliationRow {
  sentenceId: string;
  factId: string;
  format: SlotFormat;
  /** What the draft shows. */
  renderedValue: string;
  tlf: string | null;
  tlfVersion: number | null;
  cell: { row: number; col: number } | null;
  rowLabel: string | null;
  columnLabel: string | null;
  /** The TLF cell's display text, read from the table. */
  sourceDisplay: string | null;
  /** What the slot filler gives for this fact and format now. */
  expectedValue: string | null;
  matched: boolean;
  /** Why the row did not match. */
  reason?: string;
}

export interface ReconciliationSummary {
  total: number;
  matched: number;
  mismatched: number;
  allMatched: boolean;
}

export interface ReconciliationReport {
  sectionId: string;
  rows: ReconciliationRow[];
  summary: ReconciliationSummary;
}

export interface ReconcileOptions {
  sections: readonly Section[];
  /** Rendered drafts by sentence id. Sentences without a draft are rendered fresh from the facts. */
  rendered?: Readonly<Record<string, readonly RenderedPart[]>>;
}

type SlotPart = Extract<RenderedPart, { type: "slot" }>;

function reconcileSlot(
  sentenceId: string,
  part: SlotPart,
  facts: ReadonlyMap<string, Fact>,
  tlfs: readonly Tlf[],
): ReconciliationRow {
  const base = { sentenceId, factId: part.factId, format: part.format, renderedValue: part.value };
  const fact = facts.get(part.factId);
  if (!fact) {
    return {
      ...base,
      tlf: null,
      tlfVersion: null,
      cell: null,
      rowLabel: null,
      columnLabel: null,
      sourceDisplay: null,
      expectedValue: null,
      matched: false,
      reason: "The fact is not in the fact store.",
    };
  }

  const tlf = tlfs.find((t) => t.id === fact.tlf);
  const cell = tlf?.rows[fact.cell.row]?.cells[fact.cell.col];
  let expectedValue: string | null = null;
  let formatError: string | undefined;
  try {
    expectedValue = formatFact(fact, part.format);
  } catch (e) {
    formatError = (e as Error).message;
  }

  const reason = !tlf
    ? `Table ${fact.tlf} is not loaded.`
    : !cell || cell.factId !== fact.id
      ? `The cell in Table ${fact.tlf} does not point back to this fact.`
      : tlf.version !== fact.tlfVersion
        ? `The fact is from version ${fact.tlfVersion} of Table ${fact.tlf}; the table is version ${tlf.version}.`
        : cell.display !== fact.display
          ? `The fact store and the table cell disagree.`
          : formatError
            ? formatError
            : part.value !== expectedValue
              ? `The draft shows "${part.value}"; the source now gives "${expectedValue}".`
              : undefined;

  return {
    ...base,
    tlf: fact.tlf,
    tlfVersion: tlf?.version ?? null,
    cell: fact.cell,
    rowLabel: fact.rowLabel,
    columnLabel: fact.columnLabel,
    sourceDisplay: cell?.display ?? null,
    expectedValue,
    matched: reason === undefined,
    ...(reason ? { reason } : {}),
  };
}

export function summarize(rows: readonly ReconciliationRow[]): ReconciliationSummary {
  const matched = rows.filter((r) => r.matched).length;
  return {
    total: rows.length,
    matched,
    mismatched: rows.length - matched,
    allMatched: matched === rows.length,
  };
}

/** One row per number slot in the section, plus a computed summary. Throws on an unknown section. */
export function reconcileSection(
  sectionId: string,
  facts: readonly Fact[],
  tlfs: readonly Tlf[],
  { sections, rendered }: ReconcileOptions,
): ReconciliationReport {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Unknown section "${sectionId}"`);
  const store = new Map(facts.map((f) => [f.id, f]));

  const rows = section.sentences.flatMap((sentence) => {
    const parts = rendered?.[sentence.id] ?? renderSlots(sentence.text, { facts: store });
    return parts
      .filter((p): p is SlotPart => p.type === "slot")
      .map((p) => reconcileSlot(sentence.id, p, store, tlfs));
  });

  return { sectionId, rows, summary: summarize(rows) };
}

/** Plain, evidential summary text, e.g. "12 of 12 numbers match their source tables (100%)". */
export function describeReconciliation(summary: ReconciliationSummary): string {
  if (summary.total === 0) return "This section has no numbers to reconcile.";
  const share = Math.round((summary.matched * 100) / summary.total);
  return `${summary.matched} of ${summary.total} numbers match their source tables (${share}%)`;
}
