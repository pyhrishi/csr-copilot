import { describe, expect, it } from "vitest";

import type { DraftSentence } from "@/lib/types";
import { reopenSignedSections, sentenceContentChanged } from ".";

const base = {
  id: "12.2-s1",
  sectionId: "12.2",
  template: "Template {F:14.3.1.1.any_teae.velo}",
  rendered: [{ type: "text", value: "Template" }],
  provenance: "ai",
  state: "accepted",
  cites: [],
  generation: { mode: "simulated", promptVersion: "v1.0", templateVersion: "12.2-v1", at: "" },
  findings: [],
} as unknown as DraftSentence;

describe("sentenceContentChanged", () => {
  it("is false for an identical sentence and true for a new one", () => {
    expect(sentenceContentChanged(base, { ...base })).toBe(false);
    expect(sentenceContentChanged(undefined, base)).toBe(true);
  });

  it("detects template, rendered and state changes", () => {
    expect(sentenceContentChanged(base, { ...base, template: `${base.template} more` })).toBe(true);
    expect(sentenceContentChanged(base, { ...base, rendered: [] })).toBe(true);
    expect(sentenceContentChanged(base, { ...base, state: "rejected" })).toBe(true);
  });
});

describe("reopenSignedSections", () => {
  it("reopens only signed-off sections, once each, without mutating input", () => {
    const statuses = { "12.2": "signed_off", "10.1": "drafted" } as const;
    const result = reopenSignedSections(statuses, ["12.2", "12.2", "10.1", "13"]);
    expect(result.reopened).toEqual(["12.2"]);
    expect(result.statuses).toEqual({ "12.2": "in_review", "10.1": "drafted" });
    expect(statuses["12.2"]).toBe("signed_off");
  });
});
