import { describe, expect, it } from "vitest";

import { getFacts, getPatients, getSections, getTlfs } from "@/lib/data/seed";
import { computeReadinessMetrics, computeSectionStatus } from "./study-readiness";

describe("computeReadinessMetrics", () => {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const patients = getPatients();

  it("computes all 4 readiness tiles with empty drafts", () => {
    const metrics = computeReadinessMetrics({
      totalInputs: 5,
      parsedInputs: 5,
      patients,
      sections,
      facts,
      tlfs,
      draftSentences: {},
    });

    // 1. Inputs parsed: 5 of 5 (100%)
    expect(metrics.inputsParsed.count).toBe(5);
    expect(metrics.inputsParsed.total).toBe(5);
    expect(metrics.inputsParsed.percent).toBe(100);

    // 2. Open exceptions: 2 patients
    expect(metrics.openExceptions.count).toBe(2);
    expect(metrics.openExceptions.items.map((p) => p.id)).toEqual([
      "CRD301-1402",
      "CRD301-2190",
    ]);

    // 3. Sentences awaiting review
    expect(metrics.sentencesAwaitingReview.totalTemplateCount).toBe(11);
    expect(metrics.sentencesAwaitingReview.pendingCount).toBe(0);
    expect(metrics.sentencesAwaitingReview.draftedCount).toBe(0);

    // 4. Numbers reconciled: 24 of 24
    expect(metrics.numbersReconciled.total).toBe(24);
    expect(metrics.numbersReconciled.matched).toBe(24);
    expect(metrics.numbersReconciled.percent).toBe(100);
    expect(metrics.numbersReconciled.allMatched).toBe(true);
  });

  it("updates sentence review counts when drafts are present", () => {
    const metrics = computeReadinessMetrics({
      totalInputs: 5,
      parsedInputs: 5,
      patients,
      sections,
      facts,
      tlfs,
      draftSentences: {
        "10.1-s1": {
          id: "10.1-s1",
          sectionId: "10.1",
          template: "test",
          rendered: [],
          provenance: "ai",
          state: "pending",
          cites: [],
          generation: { mode: "simulated", promptVersion: "v1", templateVersion: "v1", at: "" },
          findings: [],
        },
      },
    });

    expect(metrics.sentencesAwaitingReview.draftedCount).toBe(1);
    expect(metrics.sentencesAwaitingReview.pendingCount).toBe(1);
  });
});

describe("computeSectionStatus", () => {
  const [section10_1, , , section11_4, section13] = getSections();

  it("computes not started for empty drafts", () => {
    const status = computeSectionStatus(section10_1, {});
    expect(status.status).toBe("not_started");
    expect(status.label).toBe("Not started");
    expect(status.percent).toBe(0);
  });

  it("computes locked for R2 section", () => {
    const status = computeSectionStatus(section11_4, {});
    expect(status.status).toBe("not_started");
    expect(status.label).toBe("Locked (R2)");
  });

  it("computes human authoring for Section 13", () => {
    const status = computeSectionStatus(section13, {});
    expect(status.status).toBe("not_started");
    expect(status.label).toBe("Human Authoring");
  });

  it("computes signed off when all sentences are accepted", () => {
    const drafts = Object.fromEntries(
      section10_1.sentences.map((s) => [
        s.id,
        {
          id: s.id,
          sectionId: "10.1",
          template: s.text,
          rendered: [],
          provenance: "ai" as const,
          state: "accepted" as const,
          cites: s.cites,
          generation: { mode: "simulated" as const, promptVersion: "v1", templateVersion: "v1", at: "" },
          findings: [],
        },
      ]),
    );
    const status = computeSectionStatus(section10_1, drafts);
    expect(status.status).toBe("signed_off");
    expect(status.label).toBe("Signed off");
    expect(status.percent).toBe(100);
  });

  it("computes in review when any sentence is pending", () => {
    const drafts = {
      "10.1-s1": {
        id: "10.1-s1",
        sectionId: "10.1",
        template: "t",
        rendered: [],
        provenance: "ai" as const,
        state: "pending" as const,
        cites: [],
        generation: { mode: "simulated" as const, promptVersion: "v1", templateVersion: "v1", at: "" },
        findings: [],
      },
    };
    const status = computeSectionStatus(section10_1, drafts);
    expect(status.status).toBe("in_review");
    expect(status.label).toBe("In review");
  });

  it("computes drafted when sentences are not pending or rejected but not all accepted", () => {
    const drafts = {
      "10.1-s1": {
        id: "10.1-s1",
        sectionId: "10.1",
        template: "t",
        rendered: [],
        provenance: "ai" as const,
        state: "accepted" as const,
        cites: [],
        generation: { mode: "simulated" as const, promptVersion: "v1", templateVersion: "v1", at: "" },
        findings: [],
      },
    };
    const status = computeSectionStatus(section10_1, drafts);
    expect(status.status).toBe("drafted");
    expect(status.label).toBe("Drafted");
  });
});
