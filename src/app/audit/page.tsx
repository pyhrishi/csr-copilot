import type { Metadata } from "next";

import { AuditLogView } from "@/components/audit/AuditLogView";
import { getFacts, getSections, getTlfs } from "@/lib/data/seed";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S8").title} · CSR Copilot`,
};

export default function Page() {
  const sections = getSections();
  const facts = getFacts();
  const tlfs = getTlfs();

  return <AuditLogView sections={sections} facts={facts} tlfs={tlfs} />;
}
