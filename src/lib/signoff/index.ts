// A sign-off covers the content the signer saw. Any later change to a signed-off section's
// sentences or facts reopens it for review, and the caller logs the revocation.
import type { SectionDraftStatus } from "@/lib/study-readiness";
import type { DraftSentence } from "@/lib/types";

/** True when the text, rendered values or review state of a sentence differ. */
export function sentenceContentChanged(
  before: DraftSentence | undefined,
  after: DraftSentence,
): boolean {
  if (!before) return true;
  return (
    before.template !== after.template ||
    before.state !== after.state ||
    JSON.stringify(before.rendered ?? null) !== JSON.stringify(after.rendered ?? null)
  );
}

/** Moves every listed signed-off section back to in_review. Returns new statuses and the ids reopened. */
export function reopenSignedSections(
  statuses: Readonly<Record<string, SectionDraftStatus>>,
  sectionIds: Iterable<string>,
): { statuses: Record<string, SectionDraftStatus>; reopened: string[] } {
  const next = { ...statuses };
  const reopened: string[] = [];
  for (const id of new Set(sectionIds)) {
    if (next[id] === "signed_off") {
      next[id] = "in_review";
      reopened.push(id);
    }
  }
  return { statuses: next, reopened };
}
