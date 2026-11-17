import type { Metadata } from "next";

import { TlfChangeView } from "@/components/changes/TlfChangeView";
import { getFacts, getSections, getTlfRevision, getTlfs } from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S7").title} · CSR Copilot`,
};

export default function Page() {
  const facts = getFacts();
  const tlfs = getTlfs();
  const sections = getSections();
  const revision = getTlfRevision();

  return (
    <TlfChangeView
      currentFacts={facts}
      currentTlfs={tlfs}
      sections={sections}
      revision={revision}
    />
  );
}
