import type { Metadata } from "next";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = { title: getScreen("S9").title };

export default function Page() {
  return <ScreenStub screen="S9" />;
}
