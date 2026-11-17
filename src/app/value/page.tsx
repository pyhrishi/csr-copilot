import type { Metadata } from "next";

import { ValueDashboardView } from "@/components/value/ValueDashboardView";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S11").title} · CSR Copilot`,
};

export default function Page() {
  return <ValueDashboardView />;
}
