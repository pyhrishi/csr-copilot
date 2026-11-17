import type { Metadata } from "next";

import { ReconciliationView } from "@/components/reconciliation";
import { getFacts, getRules, getSection, getSections, getTlfs } from "@/lib/data/seed";

export function generateStaticParams() {
  return getSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sections/[id]/reconciliation">): Promise<Metadata> {
  const { id } = await params;
  const section = getSection(decodeURIComponent(id));
  return {
    title: section
      ? `Reconciliation · Section ${section.id} ${section.title} · CSR Copilot`
      : "Section not found",
  };
}

export default async function Page({
  params,
}: PageProps<"/sections/[id]/reconciliation">) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  let section = getSection(decodedId);

  if (!section) {
    section = {
      id: decodedId,
      title: `Section ${decodedId}`,
      release: "R1",
      autonomy: "L2",
      tlfs: ["14.1.1"],
      sentences: [
        {
          id: `${decodedId}-s1`,
          text: `Section ${decodedId} authoring canvas. Total safety population evaluated: {F:14.1.1.safety.all} patients.`,
          cites: ["14.1.1"],
        },
      ],
    };
  }

  const activeSection = section;

  const allSections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const rules = getRules();

  return (
    <ReconciliationView
      section={activeSection}
      allSections={allSections}
      facts={facts}
      tlfs={tlfs}
      rules={rules}
    />
  );
}
