import type { Metadata } from "next";

import { StudyHomeView } from "@/components/study-home/StudyHomeView";
import {
  getFacts,
  getInputSources,
  getPatients,
  getSections,
  getStudy,
  getTlfs,
} from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S1").title} · CSR Copilot`,
};

export default function Page() {
  const study = getStudy();
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();
  const patients = getPatients();
  const inputs = getInputSources();

  const totalInputs = inputs.length;
  const parsedInputs = inputs.filter((i) => i.status === "parsed").length;

  return (
    <StudyHomeView
      study={study}
      sections={sections}
      facts={facts}
      tlfs={tlfs}
      patients={patients}
      totalInputs={totalInputs}
      parsedInputs={parsedInputs}
    />
  );
}
