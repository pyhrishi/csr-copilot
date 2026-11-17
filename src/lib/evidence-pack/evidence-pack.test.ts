import { describe, expect, it } from "vitest";

import { getFacts, getSections, getTlfs } from "@/lib/data/seed";
import type { AuditEvent } from "@/lib/types";
import { buildEvidencePack } from "./index";

describe("evidence pack compiler", () => {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();

  it("builds an evidence pack for Section 12.2 with inputs, reconciliation, and audit trail", () => {
    const mockAudit: AuditEvent[] = [
      {
        id: "evt-1",
        at: "2026-11-17T10:00:00Z",
        actor: "Dr. Sarah Chen (Medical Writer)",
        role: "writer",
        action: "generate",
        objectId: "12.2",
        detail: "Generated 5 simulated sentences",
      },
      {
        id: "evt-2",
        at: "2026-11-17T11:00:00Z",
        actor: "Marcus Vance, PhD (Biostatistician)",
        role: "biostat",
        action: "sign_off",
        objectId: "12.2",
        detail: "Biostatistician electronic sign-off",
      },
    ];

    const pack = buildEvidencePack("12.2", {
      sections,
      facts,
      tlfs,
      auditEvents: mockAudit,
      clock: () => new Date("2026-11-17T12:00:00Z"),
    });

    expect(pack.sectionId).toBe("12.2");
    expect(pack.sectionTitle).toBe("Adverse events");
    expect(pack.generatedAt).toBe("2026-11-17T12:00:00.000Z");
    expect(pack.inputs).toHaveLength(5);
    expect(pack.inputs[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(pack.reconciliation.summary.total).toBe(12);
    expect(pack.reconciliation.summary.allMatched).toBe(true);

    expect(pack.signOff).not.toBeNull();
    expect(pack.signOff?.signerName).toBe("Marcus Vance, PhD (Biostatistician)");
    expect(pack.signOff?.role).toBe("biostat");
    expect(pack.signOff?.meaningOfSignature).toContain(
      "I confirm the numbers in this section match the source TLFs",
    );
    expect(pack.auditTrail).toHaveLength(2);
  });

  it("throws on unknown section", () => {
    expect(() =>
      buildEvidencePack("unknown-section", {
        sections,
        facts,
        tlfs,
      }),
    ).toThrow(/Unknown section/);
  });
});

describe("evidence pack: TLF re-runs and revoked sign-offs", () => {
  const sections = getSections();
  const ev = (id: string, action: AuditEvent["action"], objectId: string, at: string): AuditEvent => ({
    id,
    at,
    actor: "Test actor",
    role: "biostat",
    action,
    objectId,
    detail: action,
  });
  const section = sections.find((s) => s.id === "12.2")!;
  const citedTlf = section.tlfs[0];

  it("includes re-runs of tables the section cites and carries the fiction notice", () => {
    const pack = buildEvidencePack("12.2", {
      sections,
      facts: getFacts(),
      tlfs: getTlfs(),
      auditEvents: [ev("a", "tlf_update", citedTlf, "2026-11-17T10:00:00Z"), ev("b", "tlf_update", "99.9", "2026-11-17T10:01:00Z")],
    });
    expect(pack.auditTrail.map((e) => e.id)).toEqual(["a"]);
    expect(pack.notice).toMatch(/fictional study data/);
  });

  it("drops a sign-off that a later revocation cancelled, and keeps a re-sign", () => {
    const opts = { sections, facts: getFacts(), tlfs: getTlfs() };
    const signed = ev("s1", "sign_off", "12.2", "2026-11-17T10:00:00Z");
    const revoked = ev("r1", "sign_off_revoked", "12.2", "2026-11-17T11:00:00Z");
    const resigned = ev("s2", "sign_off", "12.2", "2026-11-17T12:00:00Z");
    expect(buildEvidencePack("12.2", { ...opts, auditEvents: [signed, revoked] }).signOff).toBeNull();
    expect(
      buildEvidencePack("12.2", { ...opts, auditEvents: [signed, revoked, resigned] }).signOff?.auditEventId,
    ).toBe("s2");
  });
});
