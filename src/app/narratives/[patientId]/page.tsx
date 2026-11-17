import type { Metadata } from "next";

import { NarrativeDetailView } from "@/components/narratives/NarrativeDetailView";
import { getNarrativeTemplate, getPatient, getPatients } from "@/lib/data/seed";
import type { Patient } from "@/lib/types";

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
  const existingPatient = getPatient(decodedId);

  const activePatient: Patient = existingPatient ?? {
    id: decodedId,
    site: "Site 101",
    arm: "velo",
    armLabel: "Velorantib 100 mg",
    age: 58,
    sex: "F",
    event: "Acute pancreatitis",
    seriousness: "Hospitalization",
    severity: "severe",
    onsetDay: 24,
    resolvedDay: 35,
    outcome: "recovered",
    related: "possible",
    action: "drug_interrupted",
    timeline: [
      [1, "First dose"],
      [24, "SAE onset: Acute pancreatitis"],
      [35, "SAE resolved"],
      [45, "Last dose"],
    ],
    narrativeType: "SAE",
    status: "ready",
  };
  const template = getNarrativeTemplate();
  const allPatients = getPatients();

  return (
    <NarrativeDetailView
      patient={activePatient}
      template={template}
      allPatients={allPatients}
    />
  );
}
