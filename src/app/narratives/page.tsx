import type { Metadata } from "next";

import { NarrativesQueueView } from "@/components/narratives/NarrativesQueueView";
import { getNarrativeTemplate, getPatients } from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S5").title} · CSR Copilot`,
};

export default function Page() {
  const patients = getPatients();
  const template = getNarrativeTemplate();

  return <NarrativesQueueView patients={patients} template={template} />;
}
