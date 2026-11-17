// CITE-001: every number slot's fact must be in the sentence's citations.
import type { TemplateSegment } from "@/lib/slots";
import type { Finding } from "@/lib/types";
import { CITE_001 } from "./rules";

export function checkCitations(
  segments: readonly TemplateSegment[],
  cites: readonly string[],
): Finding[] {
  const cited = new Set(cites);
  return segments.flatMap((seg): Finding[] =>
    seg.kind === "fact" && !cited.has(seg.factId)
      ? [
          {
            ruleId: CITE_001.id,
            severity: CITE_001.severity,
            message: `${CITE_001.message} Missing: ${seg.factId}.`,
            span: [seg.start, seg.end],
            suggestion: `Add ${seg.factId} to the sentence's citations.`,
          },
        ]
      : [],
  );
}
