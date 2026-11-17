import OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";

import factsData from "@/../data/seed/facts.json";
import rulesData from "@/../data/seed/rules.json";
import sectionsData from "@/../data/seed/sections.json";
import tlfsData from "@/../data/seed/tlfs.json";
import type { StatRule } from "@/lib/data/seed-types";
import type { Fact, Section, Tlf } from "@/lib/types";

import {
  buildRetryPrompt,
  buildUserPrompt,
  generateLiveSectionDraft,
  loadDefaultSystemPrompt,
} from "./live";

const facts = factsData.facts as unknown as Fact[];
const tlfs = tlfsData.tlfs as unknown as Tlf[];
const rules = rulesData.statisticalLanguageRules as unknown as StatRule[];
const allSections = sectionsData.sections as unknown as Section[];
const section122 = allSections.find((s) => s.id === "12.2")!;

describe("live generation", () => {
  describe("buildUserPrompt", () => {
    it("includes fact IDs and labels but NEVER includes numeric values", () => {
      const prompt = buildUserPrompt(section122, facts);

      expect(prompt).toContain("14.3.1.1.any_teae.velo");
      expect(prompt).toContain("Any TEAE, Velorantib 20 mg");

      // Verify that no value displays like "201 (67.4%)" are leaked into the prompt
      for (const f of facts) {
        if (f.display && f.display.length > 2) {
          expect(prompt).not.toContain(f.display);
        }
      }
    });
  });

  describe("buildRetryPrompt", () => {
    it("formats offending sentences and their NUM-001 findings", () => {
      const prompt = buildRetryPrompt([
        {
          sentence: "Discontinuation was 22 patients.",
          findings: ["NUM-001: literal numeral '22' outside slot"],
        },
      ]);

      expect(prompt).toContain("NUM-001");
      expect(prompt).toContain("Discontinuation was 22 patients.");
      expect(prompt).toContain("The model writes words; code writes numbers.");
    });
  });

  describe("generateLiveSectionDraft", () => {
    it("loads default system prompt from file", () => {
      const prompt = loadDefaultSystemPrompt();
      expect(prompt).toContain("ICH E3");
      expect(prompt).toContain("deterministic-numbers");
    });

    it("generates live draft successfully on happy path with no NUM-001 findings", async () => {
      const mockCompletion = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: [
                "Treatment-emergent adverse events (TEAEs) were reported for {F:14.3.1.1.any_teae.velo} patients in the velorantib group and {F:14.3.1.1.any_teae.pbo} in the placebo group. cites: [14.3.1.1.any_teae.velo, 14.3.1.1.any_teae.pbo]",
                "Hypotension was observed in {F:14.3.1.2.hypotension.velo} patients receiving velorantib and {F:14.3.1.2.hypotension.pbo} receiving placebo. cites: [14.3.1.2.hypotension.velo, 14.3.1.2.hypotension.pbo]",
              ].join("\n"),
            },
          },
        ],
      });

      const mockClient = {
        chat: {
          completions: {
            create: mockCompletion,
          },
        },
      } as unknown as OpenAI;

      const onSentence = vi.fn();
      const drafts = await generateLiveSectionDraft({
        section: section122,
        facts,
        tlfs,
        rules,
        allSections,
        client: mockClient,
        model: "llama-3.3-70b-versatile",
        onSentence,
      });

      expect(mockCompletion).toHaveBeenCalledTimes(1);
      expect(onSentence).toHaveBeenCalledTimes(2);
      expect(drafts).toHaveLength(2);
      expect(drafts[0].generation.mode).toBe("live");
      expect(drafts[0].generation.model).toBe("llama-3.3-70b-versatile");

      // Verify slot rendering
      expect(drafts[0].rendered.some((p) => p.type === "slot")).toBe(true);

      // Verify no NUM-001 findings
      const numFindings = drafts.flatMap((d) =>
        d.findings.filter((f) => f.ruleId === "NUM-001"),
      );
      expect(numFindings).toHaveLength(0);
    });

    it("retries once when NUM-001 fires on initial response and succeeds on retry", async () => {
      const mockCompletion = vi
        .fn()
        // First response has raw numeral "201"
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content:
                  "Treatment-emergent adverse events were reported for 201 patients in the active group. cites: [14.3.1.1.any_teae.velo]",
              },
            },
          ],
        })
        // Second response fixes raw numeral to slot
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content:
                  "Treatment-emergent adverse events were reported for {F:14.3.1.1.any_teae.velo} patients in the active group. cites: [14.3.1.1.any_teae.velo]",
              },
            },
          ],
        });

      const mockClient = {
        chat: {
          completions: {
            create: mockCompletion,
          },
        },
      } as unknown as OpenAI;

      const drafts = await generateLiveSectionDraft({
        section: section122,
        facts,
        tlfs,
        rules,
        allSections,
        client: mockClient,
        model: "llama-3.3-70b-versatile",
      });

      // Verify it retried once
      expect(mockCompletion).toHaveBeenCalledTimes(2);

      // Second attempt passed without NUM-001
      expect(drafts[0].template).toBe(
        "Treatment-emergent adverse events were reported for {F:14.3.1.1.any_teae.velo} patients in the active group.",
      );
      const numFindings = drafts[0].findings.filter(
        (f) => f.ruleId === "NUM-001",
      );
      expect(numFindings).toHaveLength(0);
    });

    it("preserves raw template with NUM-001 finding on second failure without auto-fixing", async () => {
      const mockCompletion = vi
        .fn()
        // First response has raw numeral
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content:
                  "Adverse events occurred in 201 patients. cites: [14.3.1.1.any_teae.velo]",
              },
            },
          ],
        })
        // Second response STILL has raw numeral
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content:
                  "Adverse events occurred in 201 patients still. cites: [14.3.1.1.any_teae.velo]",
              },
            },
          ],
        });

      const mockClient = {
        chat: {
          completions: {
            create: mockCompletion,
          },
        },
      } as unknown as OpenAI;

      const drafts = await generateLiveSectionDraft({
        section: section122,
        facts,
        tlfs,
        rules,
        allSections,
        client: mockClient,
        model: "llama-3.3-70b-versatile",
      });

      expect(mockCompletion).toHaveBeenCalledTimes(2);

      // On second failure, raw template is kept with the finding
      expect(drafts[0].template).toBe(
        "Adverse events occurred in 201 patients still.",
      );
      const numFindings = drafts[0].findings.filter(
        (f) => f.ruleId === "NUM-001",
      );
      expect(numFindings.length).toBeGreaterThan(0);
      expect(numFindings[0].severity).toBe("critical");
    });

    it("throws an error when no client and no config is available", async () => {
      await expect(
        generateLiveSectionDraft({
          section: section122,
          facts,
          tlfs,
          rules,
          allSections,
          client: undefined,
        }),
      ).rejects.toThrow("Live AI mode requires an API key");
    });
  });
});
