import type { Metadata } from "next";
import { Suspense } from "react";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { SectionSubject, SubjectFallback } from "@/components/shell/StubSubjects";
import { getSection, getSections } from "@/lib/data/seed";

export function generateStaticParams() {
  return getSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/sections/[id]">): Promise<Metadata> {
  const section = getSection(decodeURIComponent((await params).id));
  return { title: section ? `${section.id} ${section.title}` : "Section not found" };
}

export default function Page({ params }: PageProps<"/sections/[id]">) {
  return (
    <ScreenStub
      screen="S3"
      subject={
        <Suspense fallback={<SubjectFallback />}>
          <SectionSubject params={params} />
        </Suspense>
      }
    />
  );
}
