import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionWorkspaceView } from "@/components/workspace/SectionWorkspaceView";
import { getFacts, getRules, getSection, getSections, getTlfs } from "@/lib/data/seed";

export function generateStaticParams() {
  return getSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sections/[id]">): Promise<Metadata> {
  const { id } = await params;
  const section = getSection(decodeURIComponent(id));
  return {
    title: section ? `${section.id} ${section.title} · CSR Copilot` : "Section not found",
  };
}

export default async function Page({ params }: PageProps<"/sections/[id]">) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const section = getSection(decodedId);

  if (!section) {
    notFound();
  }

  const allSections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const rules = getRules();

  return (
    <SectionWorkspaceView
      section={section}
      allSections={allSections}
      facts={facts}
      tlfs={tlfs}
      rules={rules}
    />
  );
}
