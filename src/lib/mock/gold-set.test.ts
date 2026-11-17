import { describe, expect, it } from "vitest";

import { computeQualityMetrics } from "./gold-set";
import type { DraftSentence, AuditEvent } from "@/lib/types";

describe("gold-set quality metrics", () => {
  it("provides baseline gold-set metrics with 100% numeric fidelity and citation precision", () => {
    const { stats, taxonomy } = computeQualityMetrics([], []);
    expect(stats).toHaveLength(4);

    const numericStat = stats.find((s) => s.id === "numeric-fidelity");
    expect(numericStat?.value).toBe("100%");

    const citationStat = stats.find((s) => s.id === "citation-precision");
    expect(citationStat?.value).toBe("100%");

    const acceptanceStat = stats.find((s) => s.id === "acceptance-rate");
    expect(acceptanceStat?.value).toBe("88.5%");

    expect(taxonomy.length).toBeGreaterThanOrEqual(4);
  });

  it("incorporates live session sentence acceptance into metrics", () => {
    const mockSentences: Partial<DraftSentence>[] = [
      { id: "12.2-s1", state: "accepted", findings: [] },
      { id: "12.2-s2", state: "accepted", findings: [] },
      { id: "12.2-s3", state: "accepted", findings: [] },
      { id: "12.2-s4", state: "rejected", findings: [] },
    ];

    const { stats } = computeQualityMetrics(mockSentences as DraftSentence[], []);
    const acceptanceStat = stats.find((s) => s.id === "acceptance-rate");
    expect(acceptanceStat?.value).toBe("75%");
    expect(acceptanceStat?.source).toBe("live_session");
  });

  it("tallies critical errors caught in session", () => {
    const mockAudit: Partial<AuditEvent>[] = [
      { id: "a1", detail: "Applied suggestion for STAT-001 finding" },
      { id: "a2", detail: "NUM-001 unverified numeral error" },
    ];

    const mockSentences: Partial<DraftSentence>[] = [
      {
        id: "12.2-s1",
        state: "pending",
        findings: [
          {
            ruleId: "STAT-001",
            severity: "critical",
            message: "Significance claim",
          },
        ],
      },
    ];

    const { stats } = computeQualityMetrics(
      mockSentences as DraftSentence[],
      mockAudit as AuditEvent[],
    );
    const criticalStat = stats.find((s) => s.id === "critical-caught");
    expect(criticalStat?.value).toContain("3 in session");
  });
});
