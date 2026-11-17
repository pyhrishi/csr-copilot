// Applying a re-run TLF: replace that table and its facts, report what changed, and find the
// sentences that cite a changed fact so they can be re-rendered and re-reconciled.
import type { TlfRevision } from "@/lib/data/seed-types";
import { factIdsIn } from "@/lib/slots";
import type { Fact, Section, Tlf } from "@/lib/types";

export interface FactChange {
  factId: string;
  /** null when the fact is new in this version. */
  before: Fact | null;
  /** null when the fact was removed in this version. */
  after: Fact | null;
}

export interface TlfUpdate {
  tlfId: string;
  fromVersion: number;
  toVersion: number;
  facts: Fact[];
  tlfs: Tlf[];
  changes: FactChange[];
  affectedSentenceIds: string[];
}

export interface CurrentData {
  facts: readonly Fact[];
  tlfs: readonly Tlf[];
  sections: readonly Section[];
}

const sameValue = (a: Fact, b: Fact) =>
  a.display === b.display && JSON.stringify(a.value) === JSON.stringify(b.value);

/** Returns new arrays; the inputs are never mutated. Throws if the revision is not a newer version of a loaded TLF. */
export function applyTlfVersion(current: CurrentData, revision: TlfRevision): TlfUpdate {
  const { tlf } = revision;
  const previous = current.tlfs.find((t) => t.id === tlf.id);
  if (!previous) throw new Error(`Table ${tlf.id} is not loaded`);
  if (tlf.version <= previous.version) {
    throw new Error(
      `Table ${tlf.id} version ${tlf.version} is not newer than version ${previous.version}`,
    );
  }
  for (const f of revision.facts) {
    if (f.tlf !== tlf.id || f.tlfVersion !== tlf.version) {
      throw new Error(`Fact ${f.id} does not belong to version ${tlf.version} of Table ${tlf.id}`);
    }
  }

  const oldFacts = new Map(current.facts.filter((f) => f.tlf === tlf.id).map((f) => [f.id, f]));
  const newFacts = new Map(revision.facts.map((f) => [f.id, f]));

  const changes: FactChange[] = [
    ...revision.facts.flatMap((after): FactChange[] => {
      const before = oldFacts.get(after.id) ?? null;
      return before && sameValue(before, after) ? [] : [{ factId: after.id, before, after }];
    }),
    ...[...oldFacts.values()]
      .filter((before) => !newFacts.has(before.id))
      .map((before) => ({ factId: before.id, before, after: null })),
  ];

  const facts = [
    ...current.facts.flatMap((f) =>
      f.tlf !== tlf.id ? [f] : newFacts.has(f.id) ? [newFacts.get(f.id)!] : [],
    ),
    ...revision.facts.filter((f) => !oldFacts.has(f.id)),
  ];

  const changed = new Set(changes.map((c) => c.factId));
  const affectedSentenceIds = current.sections.flatMap((s) =>
    s.sentences
      .filter((sen) => factIdsIn(sen.text).some((id) => changed.has(id)))
      .map((sen) => sen.id),
  );

  return {
    tlfId: tlf.id,
    fromVersion: previous.version,
    toVersion: tlf.version,
    facts,
    tlfs: current.tlfs.map((t) => (t.id === tlf.id ? tlf : t)),
    changes,
    affectedSentenceIds,
  };
}
