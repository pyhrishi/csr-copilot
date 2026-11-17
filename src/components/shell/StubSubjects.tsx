// URL-dependent subject lines for the dynamic screen stubs. Each awaits `params` itself so pages can
// wrap it in <Suspense> and keep the URL-independent App Shell instant (Next 16 Partial Prefetching).
import { notFound } from "next/navigation";

import { getPatient, getSection } from "@/lib/data/seed";

export async function SectionSubject({ params }: { params: Promise<{ id: string }> }) {
  const section = getSection(decodeURIComponent((await params).id));
  if (!section) notFound();
  return (
    <>
      Section {section.id} · {section.title}
    </>
  );
}

export async function PatientSubject({ params }: { params: Promise<{ patientId: string }> }) {
  const patient = getPatient(decodeURIComponent((await params).patientId));
  if (!patient) notFound();
  return (
    <>
      {patient.id} · {patient.event} · {patient.armLabel}
    </>
  );
}

export function SubjectFallback() {
  return <span className="text-subtle">Loading…</span>;
}
