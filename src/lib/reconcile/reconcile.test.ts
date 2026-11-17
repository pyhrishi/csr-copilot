import { describe, expect, it } from "vitest";

import { getFacts, getSections, getTlfRevision, getTlfs } from "@/lib/data/seed";
import { factIdsIn, renderSlots } from "@/lib/slots";
import { applyTlfVersion } from "@/lib/tlf-change";
import type { Fact, RenderedPart, Tlf } from "@/lib/types";
import { describeReconciliation, reconcileSection, summarize } from ".";

const facts = getFacts();
const tlfs = getTlfs();
const sections = getSections();
const DEMO = "12.2";
const slotCount = (sectionId: string) =>
  sections
    .find((s) => s.id === sectionId)!
    .sentences.reduce((n, s) => n + factIdsIn(s.text).length, 0);
const renderAll = (sectionId: string, store: readonly Fact[]) =>
  Object.fromEntries(
    sections
      .find((s) => s.id === sectionId)!
      .sentences.map((s) => [s.id, renderSlots(s.text, { facts: store })] as const),
  );

describe("reconcileSection", () => {
  it(`reconciles every number in ${DEMO} against its source table`, () => {
    const { rows, summary } = reconcileSection(DEMO, facts, tlfs, { sections });
    expect(summary.total).toBe(slotCount(DEMO));
    expect(summary).toEqual({
      total: summary.total,
      matched: summary.total,
      mismatched: 0,
      allMatched: true,
    });
    expect(describeReconciliation(summary)).toBe(
      `${summary.total} of ${summary.total} numbers match their source tables (100%)`,
    );
    for (const row of rows) {
      const fact = facts.find((f) => f.id === row.factId)!;
      expect(row).toMatchObject({
        tlf: fact.tlf,
        tlfVersion: fact.tlfVersion,
        cell: fact.cell,
        rowLabel: fact.rowLabel,
        columnLabel: fact.columnLabel,
        sourceDisplay: fact.display,
        renderedValue: row.expectedValue,
        matched: true,
      });
      expect(row.reason).toBeUndefined();
    }
  });

  it("gives one row per slot, in sentence order, for every section", () => {
    for (const section of sections) {
      const { rows, summary } = reconcileSection(section.id, facts, tlfs, { sections });
      expect(rows.map((r) => r.factId)).toEqual(
        section.sentences.flatMap((s) => factIdsIn(s.text)),
      );
      expect(summary.allMatched).toBe(true);
    }
  });

  it("explains a section with no numbers", () => {
    const empty = sections.find((s) => s.sentences.length === 0)!;
    const { summary } = reconcileSection(empty.id, facts, tlfs, { sections });
    expect(summary.total).toBe(0);
    expect(describeReconciliation(summary)).toBe("This section has no numbers to reconcile.");
  });

  it("throws on an unknown section", () => {
    expect(() => reconcileSection("99.9", facts, tlfs, { sections })).toThrow(/Unknown section/);
  });

  it("computes partial summaries", () => {
    const summary = summarize([
      { matched: true } as never,
      { matched: false } as never,
      { matched: true } as never,
    ]);
    expect(summary).toEqual({ total: 3, matched: 2, mismatched: 1, allMatched: false });
    expect(describeReconciliation(summary)).toBe("2 of 3 numbers match their source tables (67%)");
  });
});

describe("reconciliation after TLF v2 (dizziness re-coded)", () => {
  const revision = getTlfRevision();
  const update = applyTlfVersion({ facts, tlfs, sections }, revision);

  it("changes sentence 12.2-s4, which still reconciles", () => {
    expect(update.affectedSentenceIds).toEqual(["12.2-s4"]);
    const s4 = sections.flatMap((s) => s.sentences).find((s) => s.id === "12.2-s4")!;
    const before = renderSlots(s4.text, { facts });
    const after = renderSlots(s4.text, { facts: update.facts });
    expect(after).not.toEqual(before);

    const changedId = update.changes[0].factId;
    const slot = (parts: RenderedPart[]) =>
      parts.find((p) => p.type === "slot" && p.factId === changedId);
    expect(slot(before)?.value).toBe(update.changes[0].before!.display);
    expect(slot(after)?.value).toBe(update.changes[0].after!.display);

    const report = reconcileSection(DEMO, update.facts, update.tlfs, { sections });
    expect(report.summary.allMatched).toBe(true);
    expect(report.rows.find((r) => r.factId === changedId)?.tlfVersion).toBe(revision.tlf.version);
  });

  it("flags exactly the stale number when v1 drafts are checked against v2 data", () => {
    const stale = renderAll(DEMO, facts);
    const report = reconcileSection(DEMO, update.facts, update.tlfs, { sections, rendered: stale });
    expect(report.summary.mismatched).toBe(1);
    const [row] = report.rows.filter((r) => !r.matched);
    expect(row.factId).toBe(update.changes[0].factId);
    expect(row.sentenceId).toBe("12.2-s4");
    expect(row.reason).toMatch(/draft shows/);

    const fresh = renderAll(DEMO, update.facts);
    expect(
      reconcileSection(DEMO, update.facts, update.tlfs, { sections, rendered: fresh }).summary
        .allMatched,
    ).toBe(true);
  });
});

describe("mismatch reasons", () => {
  const section = sections.find((s) => s.id === DEMO)!;
  const first = section.sentences[0];
  const firstFactId = factIdsIn(first.text)[0];
  const fact = facts.find((f) => f.id === firstFactId)!;
  const firstRow = (
    factsIn: readonly Fact[],
    tlfsIn: readonly Tlf[],
    rendered?: Record<string, RenderedPart[]>,
  ) => reconcileSection(DEMO, factsIn, tlfsIn, { sections, rendered }).rows[0];
  const withTable = (edit: (t: Tlf) => Tlf) =>
    tlfs.map((t) => (t.id === fact.tlf ? edit(structuredClone(t)) : t));

  it("reports a fact missing from the store", () => {
    const rendered = { [first.id]: renderSlots(first.text, { facts }) };
    const row = firstRow(
      facts.filter((f) => f.id !== firstFactId),
      tlfs,
      rendered,
    );
    expect(row).toMatchObject({ matched: false, sourceDisplay: null, expectedValue: null });
    expect(row.reason).toMatch(/not in the fact store/);
  });

  it("reports a table that is not loaded", () => {
    const row = firstRow(
      facts,
      tlfs.filter((t) => t.id !== fact.tlf),
    );
    expect(row).toMatchObject({ matched: false, tlfVersion: null, sourceDisplay: null });
    expect(row.reason).toMatch(/not loaded/);
  });

  it("reports a cell that does not point back to the fact", () => {
    const row = firstRow(
      facts,
      withTable((t) => {
        t.rows[fact.cell.row].cells[fact.cell.col].factId = "other";
        return t;
      }),
    );
    expect(row.reason).toMatch(/does not point back/);
  });

  it("reports a fact from a different table version", () => {
    const row = firstRow(
      facts,
      withTable((t) => ({ ...t, version: t.version + 1 })),
    );
    expect(row.reason).toMatch(/version/);
  });

  it("reports a fact store that disagrees with the table cell", () => {
    const row = firstRow(
      facts,
      withTable((t) => {
        t.rows[fact.cell.row].cells[fact.cell.col].display = `${fact.display} (edited)`;
        return t;
      }),
    );
    expect(row.reason).toMatch(/disagree/);
    expect(row.sourceDisplay).not.toBe(fact.display);
  });

  it("reports a slot format that no longer fits the fact", () => {
    const nonCount = facts.find((f) => f.kind !== "n_pct")!;
    const swapped = facts.map((f) =>
      f.id === firstFactId
        ? {
            ...nonCount,
            id: f.id,
            tlf: f.tlf,
            tlfVersion: f.tlfVersion,
            cell: f.cell,
            display: f.display,
          }
        : f,
    );
    const rendered = {
      [first.id]: [
        { type: "slot", factId: firstFactId, format: "n", value: "x" },
      ] as RenderedPart[],
    };
    const row = firstRow(swapped, tlfs, rendered);
    expect(row.matched).toBe(false);
    expect(row.expectedValue).toBeNull();
    expect(row.reason).toMatch(/needs a count fact/);
  });
});
