import type { Metadata } from "next";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = { title: getScreen("S5").title };

export default function Page() {
  return <ScreenStub screen="S5" />;
}
