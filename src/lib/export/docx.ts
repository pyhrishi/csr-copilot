import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

import { partsToText, renderSlots } from "@/lib/slots";
import type { AuditEvent, DraftSentence, Fact, Section } from "@/lib/types";

export interface ExportSectionDocxOptions {
  section: Section;
  sentences?: Record<string, DraftSentence>;
  facts: readonly Fact[];
}

export interface ExportFullDossierOptions {
  studyName?: string;
  protocolId?: string;
  sections: readonly Section[];
  sentences?: Record<string, DraftSentence>;
  facts: readonly Fact[];
  auditEvents?: readonly AuditEvent[];
}

/**
 * Builds and downloads a production Word (.docx) document for a CSR section
 * with headings, fully rendered numbers, and cited TLF references.
 */
export async function exportSectionToDocx({
  section,
  sentences = {},
  facts,
}: ExportSectionDocxOptions): Promise<Blob> {
  const factMap = new Map(facts.map((f) => [f.id, f]));

  // Build body paragraphs for each template sentence
  const bodyParagraphs: Paragraph[] = [];

  for (const sentenceTemplate of section.sentences) {
    const draft = sentences[sentenceTemplate.id];
    let sentenceText = "";

    if (draft && draft.rendered && draft.rendered.length > 0) {
      sentenceText = partsToText(draft.rendered);
    } else {
      const rendered = renderSlots(sentenceTemplate.text, { facts: factMap });
      sentenceText = partsToText(rendered);
    }

    bodyParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sentenceText,
            size: 24, // 12pt
            font: "Public Sans",
          }),
        ],
        spacing: { after: 200, line: 340 },
      }),
    );
  }

  // Collect all cited TLFs
  const citedTlfs = [...new Set(section.tlfs)].map((t) => `Table ${t}`).join(", ");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Meridian Biopharma · Clinical Study Report",
            style: "Subtitle",
            children: [
              new TextRun({
                text: "Meridian Biopharma · Protocol CRD-301 (velorantib 20 mg) · Phase III",
                color: "5F6470",
                size: 20, // 10pt
                font: "Public Sans",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: `${section.id} ${section.title}`,
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: `${section.id} ${section.title}`,
                bold: true,
                size: 32, // 16pt
                color: "14213D",
                font: "EB Garamond",
              }),
            ],
            spacing: { after: 280 },
          }),
          ...bodyParagraphs,
          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: `Sources cited: ${citedTlfs}. Numbers filled from the fact store; see the reconciliation report for matches.`,
                italics: true,
                color: "0E6E6A",
                size: 18, // 9pt
                font: "Public Sans",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Compiles and exports the complete multi-section CSR dossier to Word (.docx)
 * with title page, ICH E3 Table of Contents, all sections, and regulatory citations.
 */
export async function exportFullCsrDossierToDocx({
  studyName = "Velorantib Phase III in Moderate-to-Severe Crohn's Disease",
  protocolId = "CRD-301",
  sections,
  sentences = {},
  facts,
  auditEvents = [],
}: ExportFullDossierOptions): Promise<Blob> {
  const factMap = new Map(facts.map((f) => [f.id, f]));
  const docChildren: Paragraph[] = [];

  // Front Matter / Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: "CLINICAL STUDY REPORT (ICH E3)",
          bold: true,
          size: 40,
          color: "14213D",
          font: "EB Garamond",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Protocol: ${protocolId} · Investigational Product: velorantib 100 mg · Phase III`,
          bold: true,
          size: 24,
          color: "0E6E6A",
          font: "Public Sans",
        }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Sponsor: Meridian Biopharma · Study: ${studyName} · Date: ${new Date().toLocaleDateString()}`,
          size: 20,
          color: "5F6470",
          font: "Public Sans",
        }),
      ],
      spacing: { after: 400 },
    }),
  );

  // Table of Contents Summary
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: "Table of Contents (ICH E3 Modules)",
          bold: true,
          size: 28,
          color: "14213D",
          font: "EB Garamond",
        }),
      ],
      spacing: { after: 200 },
    }),
  );

  for (const sec of sections) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• Section ${sec.id}: ${sec.title}`,
            size: 22,
            font: "Public Sans",
          }),
        ],
        spacing: { after: 100 },
      }),
    );
  }

  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "• Appendix 14.3.3: Patient-Level Serious Adverse Event Narratives",
          size: 22,
          font: "Public Sans",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Appendix 16.1.4: 21 CFR Part 11 Audit Trail & Electronic Signatures",
          size: 22,
          font: "Public Sans",
        }),
      ],
      spacing: { after: 400 },
    }),
  );

  // Render each section
  for (const sec of sections) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `Section ${sec.id} · ${sec.title}`,
            bold: true,
            size: 30,
            color: "14213D",
            font: "EB Garamond",
          }),
        ],
        spacing: { before: 400, after: 200 },
      }),
    );

    for (const st of sec.sentences) {
      const draft = sentences[st.id];
      let text = "";
      if (draft && draft.rendered && draft.rendered.length > 0) {
        text = partsToText(draft.rendered);
      } else {
        const rendered = renderSlots(st.text, { facts: factMap });
        text = partsToText(rendered);
      }

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              size: 24,
              font: "Public Sans",
            }),
          ],
          spacing: { after: 160, line: 320 },
        }),
      );
    }

    const cited = [...new Set(sec.tlfs)].map((t) => `Table ${t}`).join(", ");
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[Cited Statistical Sources: ${cited || "None"}]`,
            italics: true,
            size: 18,
            color: "0E6E6A",
            font: "Public Sans",
          }),
        ],
        spacing: { after: 300 },
      }),
    );
  }

  // Appendix: Audit Trail & Sign-Offs
  if (auditEvents.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: "Appendix 16.1.4 · 21 CFR Part 11 Audit Trail & Sign-offs",
            bold: true,
            size: 28,
            color: "14213D",
            font: "EB Garamond",
          }),
        ],
        spacing: { before: 400, after: 200 },
      }),
    );

    for (const ev of auditEvents.slice(0, 20)) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${new Date(ev.at).toLocaleString()}] ${ev.actor} (${ev.role}) — ${ev.action.toUpperCase()}: ${ev.detail}`,
              size: 20,
              font: "Public Sans",
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: docChildren }],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers a browser download of the generated DOCX blob.
 */
export function downloadDocxBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
