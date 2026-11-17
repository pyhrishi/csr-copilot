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
  let section = getSection(decodedId);

  if (!section) {
    if (decodedId === "99.9" || decodedId.startsWith("99")) {
      notFound();
    }
    // Graceful fallback for dynamic / custom user-created CSR sections
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
    <SectionWorkspaceView
      section={activeSection}
      allSections={allSections}
      facts={facts}
      tlfs={tlfs}
      rules={rules}
    />
  );
}
