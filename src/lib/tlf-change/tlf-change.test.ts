import { describe, expect, it } from "vitest";

import { getFacts, getSections, getTlfRevision, getTlfs } from "@/lib/data/seed";
import type { TlfRevision } from "@/lib/data/seed-types";
import { formatFactChange } from "@/lib/slots";
import { applyTlfVersion, tlfCellDiff } from ".";

const current = { facts: getFacts(), tlfs: getTlfs(), sections: getSections() };
const revision = getTlfRevision();

describe("applyTlfVersion", () => {
  it("reports only the facts whose value changed, and the sentences that cite them", () => {
    const update = applyTlfVersion(current, revision);
    const oldTable = current.tlfs.find((t) => t.id === revision.tlf.id)!;
    expect(update).toMatchObject({
      tlfId: revision.tlf.id,
      fromVersion: oldTable.version,
      toVersion: revision.tlf.version,
    });
    expect(update.changes.map((c) => c.factId)).toEqual(["14.3.1.2.dizziness.velo"]);
    const [change] = update.changes;
    expect(change.before?.display).not.toBe(change.after?.display);
    expect(change.after?.tlfVersion).toBe(revision.tlf.version);
    expect(update.affectedSentenceIds).toEqual(["12.2-s4"]);
  });

  it("replaces the table and its facts, keeping the rest of the store", () => {
    const update = applyTlfVersion(current, revision);
    expect(update.facts).toHaveLength(current.facts.length);
    expect(update.facts.filter((f) => f.tlf === revision.tlf.id)).toEqual(revision.facts);
    expect(update.facts.filter((f) => f.tlf !== revision.tlf.id)).toEqual(
      current.facts.filter((f) => f.tlf !== revision.tlf.id),
    );
    expect(update.tlfs.find((t) => t.id === revision.tlf.id)).toBe(revision.tlf);
    expect(update.tlfs).toHaveLength(current.tlfs.length);
  });

  it("does not mutate its inputs", () => {
    const snapshot = structuredClone({ ...current, revision });
    applyTlfVersion(current, revision);
    expect({ ...current, revision }).toEqual(snapshot);
  });

  it("reports added and removed facts", () => {
    const [removed, ...kept] = revision.facts;
    const added = { ...kept[0], id: `${revision.tlf.id}.new_row.velo` };
    const update = applyTlfVersion(current, { ...revision, facts: [...kept, added] });
    expect(update.changes).toContainEqual({ factId: added.id, before: null, after: added });
    expect(update.changes).toContainEqual({
      factId: removed.id,
      before: expect.anything(),
      after: null,
    });
    expect(update.facts.some((f) => f.id === removed.id)).toBe(false);
    expect(update.facts.at(-1)).toBe(added);
  });

  it("refuses an unknown table, an older or same version, and facts from another version", () => {
    expect(() =>
      applyTlfVersion(current, { ...revision, tlf: { ...revision.tlf, id: "99.9" } }),
    ).toThrow(/not loaded/);
    const oldVersion = current.tlfs.find((t) => t.id === revision.tlf.id)!.version;
    expect(() =>
      applyTlfVersion(current, { ...revision, tlf: { ...revision.tlf, version: oldVersion } }),
    ).toThrow(/not newer/);
    const foreign: TlfRevision = {
      ...revision,
      facts: [{ ...revision.facts[0], tlfVersion: oldVersion }, ...revision.facts.slice(1)],
    };
    expect(() => applyTlfVersion(current, foreign)).toThrow(/does not belong/);
  });
});

describe("tlfCellDiff", () => {
  it("lists every cell of the re-run table with its v1 and v2 facts, flagging only the change", () => {
    const update = applyTlfVersion(current, revision);
    const cells = tlfCellDiff(update);
    const cellCount = revision.tlf.rows.reduce((n, r) => n + r.cells.length, 0);
    expect(cells).toHaveLength(cellCount);
    expect(cells.filter((c) => c.changed).map((c) => c.factId)).toEqual(["14.3.1.2.dizziness.velo"]);
    for (const c of cells) {
      const v1 = current.facts.find((f) => f.id === c.factId)!;
      const v2 = revision.facts.find((f) => f.id === c.factId)!;
      expect(c.before).toEqual(v1);
      expect(c.after).toEqual(v2);
      expect(c.changed).toBe(v1.display !== v2.display);
    }
  });

  it("feeds the delta formatter values that agree with the displayed cells", () => {
    const update = applyTlfVersion(current, revision);
    const change = tlfCellDiff(update).find((c) => c.changed)!;
    const before = change.before!.value as { n: number };
    const after = change.after!.value as { n: number };
    expect(formatFactChange(change.before!, change.after!)).toMatch(
      new RegExp(`^\\+${after.n - before.n} patient`),
    );
  });
});
