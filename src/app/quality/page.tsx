import type { Metadata } from "next";

import { QualityView } from "@/components/quality/QualityView";
import { getFacts, getPatients } from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S9").title} · CSR Copilot`,
};

export default function Page() {
  const facts = getFacts();
  const patients = getPatients();

  return <QualityView facts={facts} patients={patients} />;
}
