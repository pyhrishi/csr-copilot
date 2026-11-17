import type { Metadata } from "next";
import { Suspense } from "react";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { PatientSubject, SubjectFallback } from "@/components/shell/StubSubjects";
import { getPatient, getPatients } from "@/lib/data/seed";

export function generateStaticParams() {
  return getPatients().map((p) => ({ patientId: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/narratives/[patientId]">): Promise<Metadata> {
  const patient = getPatient(decodeURIComponent((await params).patientId));
  return { title: patient ? `Narrative · ${patient.id}` : "Patient not found" };
}

export default function Page({ params }: PageProps<"/narratives/[patientId]">) {
  return (
    <ScreenStub
      screen="S6"
      subject={
        <Suspense fallback={<SubjectFallback />}>
          <PatientSubject params={params} />
        </Suspense>
      }
    />
  );
}
