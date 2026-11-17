import { describe, expect, it } from "vitest";
import { extractSlotIds, parseModelOutput } from "./live-parser";

describe("live-parser", () => {
  describe("extractSlotIds", () => {
    it("extracts plain slots and formatted slots", () => {
      const template =
        "Adverse events in {F:14.3.1.1.any_teae.velo} and completed by {F:14.1.1.completed.pbo|n} patients.";
      expect(extractSlotIds(template)).toEqual([
        "14.3.1.1.any_teae.velo",
        "14.1.1.completed.pbo",
      ]);
    });

    it("deduplicates repeated slots in template", () => {
      const template = "Slot {F:fact.one} compared to {F:fact.one|pct}.";
      expect(extractSlotIds(template)).toEqual(["fact.one"]);
    });

    it("returns empty array when no slots exist", () => {
      expect(extractSlotIds("No slots in this sentence.")).toEqual([]);
    });
  });

  describe("parseModelOutput", () => {
    it("parses lines with standard cites: [id1, id2] syntax", () => {
      const output = `
# Section 12.2 Draft

Treatment-emergent adverse events were reported for {F:14.3.1.1.any_teae.velo} patients in the active group and {F:14.3.1.1.any_teae.pbo} in placebo. cites: [14.3.1.1.any_teae.velo, 14.3.1.1.any_teae.pbo]
Hypotension was observed in {F:14.3.1.2.hypotension.velo} patients. cites: [14.3.1.2.hypotension.velo]
`;
      const result = parseModelOutput(output);
      expect(result).toHaveLength(2);
      expect(result[0].template).toBe(
        "Treatment-emergent adverse events were reported for {F:14.3.1.1.any_teae.velo} patients in the active group and {F:14.3.1.1.any_teae.pbo} in placebo."
      );
      expect(result[0].cites).toEqual([
        "14.3.1.1.any_teae.velo",
        "14.3.1.1.any_teae.pbo",
      ]);
      expect(result[1].template).toBe(
        "Hypotension was observed in {F:14.3.1.2.hypotension.velo} patients."
      );
      expect(result[1].cites).toEqual(["14.3.1.2.hypotension.velo"]);
    });

    it("handles stripped bullet points and unbracketed cites", () => {
      const output = `
- TEAEs occurred in {F:14.3.1.1.any_teae.velo} patients. cites: 14.3.1.1.any_teae.velo
1. Related events occurred in {F:14.3.1.1.related.velo}. cites: 14.3.1.1.related.velo.
`;
      const result = parseModelOutput(output);
      expect(result).toHaveLength(2);
      expect(result[0].template).toBe("TEAEs occurred in {F:14.3.1.1.any_teae.velo} patients.");
      expect(result[0].cites).toEqual(["14.3.1.1.any_teae.velo"]);
      expect(result[1].template).toBe("Related events occurred in {F:14.3.1.1.related.velo}.");
      expect(result[1].cites).toEqual(["14.3.1.1.related.velo"]);
    });

    it("auto-populates cites from slots if cites: suffix was omitted", () => {
      const output =
        "Adverse events were reported for {F:14.3.1.1.any_teae.velo} and {F:14.3.1.1.any_teae.pbo} subjects.";
      const result = parseModelOutput(output);
      expect(result).toHaveLength(1);
      expect(result[0].cites).toEqual([
        "14.3.1.1.any_teae.velo",
        "14.3.1.1.any_teae.pbo",
      ]);
    });

    it("handles empty or malformed input safely", () => {
      expect(parseModelOutput("")).toEqual([]);
      expect(parseModelOutput("### Title\n\n\n```json\n{}```")).toEqual([]);
      expect(
        parseModelOutput(
          "Here is the draft:\nAdverse events occurred in {F:14.3.1.1.any_teae.velo} patients.",
        ),
      ).toHaveLength(1);
      // @ts-expect-error test non-string input
      expect(parseModelOutput(null)).toEqual([]);
    });
  });
});
