import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EvidencePackView } from "@/components/audit/EvidencePackView";
import { getInputSources } from "@/lib/data/inputs";
import { getFacts, getSection, getSections, getTlfs } from "@/lib/data/seed";

export function generateStaticParams() {
  return getSections().map((s) => ({ sectionId: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/audit/evidence/[sectionId]">): Promise<Metadata> {
  const { sectionId } = await params;
  const decodedId = decodeURIComponent(sectionId);
  const section = getSection(decodedId);
  return {
    title: section
      ? `Evidence Pack · Section ${section.id} · CSR Copilot`
      : "Section not found",
  };
}

export default async function Page({
  params,
}: PageProps<"/audit/evidence/[sectionId]">) {
  const { sectionId } = await params;
  const decodedId = decodeURIComponent(sectionId);
  const section = getSection(decodedId);

  if (!section) {
    notFound();
  }

  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const rawInputs = getInputSources();
  const inputs = rawInputs.map((inp) => ({
    name: inp.name,
    version: inp.version,
    sha256: inp.sha256,
  }));

  return (
    <EvidencePackView
      sectionId={decodedId}
      sections={sections}
      facts={facts}
      tlfs={tlfs}
      inputs={inputs}
    />
  );
}
