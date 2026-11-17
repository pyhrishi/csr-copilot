import type { Metadata } from "next";

import { AutonomyView } from "@/components/autonomy/AutonomyView";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = {
  title: `${getScreen("S10").title} · CSR Copilot`,
};

export default function Page() {
  return <AutonomyView />;
}
