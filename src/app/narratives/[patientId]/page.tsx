import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NarrativeDetailView } from "@/components/narratives/NarrativeDetailView";
import { getNarrativeTemplate, getPatient, getPatients } from "@/lib/data/seed";

export function generateStaticParams() {
  return getPatients().map((p) => ({ patientId: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/narratives/[patientId]">): Promise<Metadata> {
  const { patientId } = await params;
  const patient = getPatient(decodeURIComponent(patientId));
  return {
    title: patient ? `Narrative · ${patient.id} · CSR Copilot` : "Patient not found",
  };
}

export default async function Page({ params }: PageProps<"/narratives/[patientId]">) {
  const { patientId } = await params;
  const decodedId = decodeURIComponent(patientId);
  const patient = getPatient(decodedId);

  if (!patient) {
    notFound();
  }

  const template = getNarrativeTemplate();
  const allPatients = getPatients();

  return (
    <NarrativeDetailView
      patient={patient}
      template={template}
      allPatients={allPatients}
    />
  );
}
