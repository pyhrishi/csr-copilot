import type { Metadata } from "next";

import { DataReadinessView } from "@/components/data-readiness/DataReadinessView";
import {
  getFacts,
  getInputSources,
  getPatients,
  getSections,
  getTlfs,
} from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S2").title} · CSR Copilot`,
};

export default function Page() {
  const inputs = getInputSources();
  const tlfs = getTlfs();
  const facts = getFacts();
  const sections = getSections();
  const patients = getPatients();
  const exceptions = patients.filter((p) => p.status === "exception");

  return (
    <DataReadinessView
      inputs={inputs}
      tlfs={tlfs}
      facts={facts}
      sections={sections}
      exceptions={exceptions}
    />
  );
}
